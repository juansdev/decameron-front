import React, {useEffect, useState} from "react";
import Modal from './components/Modal/Modal';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

function App() {
  const MySwal = withReactContent(Swal)
  const apiUrl = process.env.REACT_APP_API_URL;
  const [dataIds, setDataIDS] = useState({});
  const [titleSwal, setTitleSwal] = useState('');
  const [CSRF, setCSRF] = useState('');
  const [data, setData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    nit: '',
    hotel_id: '',
    department_id: '',
    municipality_id: '',
    address: '',
    number_rooms: ''
  });

  const openSwal = async (callbackAPIs) => await MySwal.fire({
    title: titleSwal,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: async () => {
      MySwal.showLoading();
      return await Promise.all(callbackAPIs.map(async (callbackAPI, index) => await callbackAPI())).then(() => MySwal.close());
    }
  });
  const consumeAPI = async (url, method, data = undefined) => {
    const init = {
      method,
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        "Accept": "application/json, text-plain, */*",
        "X-Requested-With": "XMLHttpRequest",
      },
      credentials: "include",
      body: data ? JSON.stringify(data) : undefined
    };
    if (CSRF) init['headers']['X-CSRF-TOKEN'] = CSRF;
    return await fetch(url, init).then(response => response.json().then(res => ({status: response.status, ...res})).catch(() => response)).catch(error => console.error(error));
  }

  const fetchData = async () => {
    const updateData = async () => {
      const response = await consumeAPI(`${apiUrl}/municipal-hotels`, 'GET');
      setData(response.data);
      return response;
    };
    return await openSwal([updateData]);
  };
  const listDepartments = async () => {
    const response = await consumeAPI(`${apiUrl}/api/departments`, 'GET');
    setDepartments(response.data);
  };

  const updateFormData = ({key, value, resetData}) => {
    const updateFormData = JSON.parse(JSON.stringify(formData));
    if (key && value && updateFormData[key] !== value)
      updateFormData[key] = value;
    else if (resetData)
      for (const key in formData) {
        updateFormData[key] = '';
      }
    setFormData(updateFormData);
  };
  const updateMunicipalHotelAndHotel = async (method, id = undefined, hotel_id = undefined) => {
    const errors = {};
    if (!formData.name.trim())
      errors.name = "El nombre es requerido";
    if (!formData.nit.trim())
      errors.nit = "El NIT es requerido";
    if (formData.department_id === '')
      errors.department_id = "El departamento es requerido";
    if (formData.municipality_id === '')
      errors.municipality_id = "El municipio es requerido";
    if (Object.keys(errors).length !== 0) alert(Object.values(errors).join('\n'));
    else {
      const {name, nit, address, number_rooms, municipality_id} = formData;
      let data = {
        name,
        nit
      };
      await consumeAPI(`${apiUrl}/hotels` + (method === 'PUT' ? `/${hotel_id}` : ''), method, data).then(async (res) => {
        data = {'hotel_id': res.data.id, municipality_id, address, number_rooms};
      }).then(async () => await consumeAPI(`${apiUrl}/municipal-hotels` + (method === 'PUT' ? `/${id}` : ''), method, data).then(() => updateFormData({resetData: true})));
      setTitleSwal('Cargando los nuevos datos...');
    }
  };
  const handleFormChange = async (event) => {
    const {name, value} = event.target;
    if (name === 'department_id' && (formData.department_id !== value || !municipalities.length)) {
      const response = await consumeAPI(`${apiUrl}/api/municipalities?department_id=${value}`, 'GET');
      setMunicipalities(response.data);
    }
    updateFormData({key: name, value});
  };
  const handleFormSubmit = async () => updateMunicipalHotelAndHotel('POST');
  const handleUpdate = async (id, hotel_id) => await updateMunicipalHotelAndHotel('PUT', id, hotel_id);
  const handleChangeStatus = async (id, hotel_id) => {
    setDataIDS({id, hotel_id});
    setTitleSwal('Actualizando el estado del Hotel...');
  };

  useEffect(() => {
    setTitleSwal('Realizando conexión a la base de datos...');
  }, []);
  useEffect(() => {
    if (titleSwal === 'Realizando conexión a la base de datos...') {
      const getCSRF = () => consumeAPI(`${apiUrl}/CSRF`, 'GET').then(async res => {
        const {csrf} = res;
        setCSRF(csrf);
        setTitleSwal('Cargando los datos...');
      });
      openSwal([getCSRF]);
    } else if (titleSwal === 'Cargando los datos...') {
      listDepartments().then(async () => {
        await fetchData();
        setTitleSwal('');
      });
    } else if (titleSwal === 'Actualizando el estado del Hotel...' && Object.keys(dataIds).length) {
      const {id, hotel_id} = dataIds;
      const changeStatusHotel = async () => await consumeAPI(`${apiUrl}/hotels/${hotel_id}/status`, 'PUT');
      const changeStatusMunicipalHotel = async () => await consumeAPI(`${apiUrl}/municipal-hotels/${id}/status`, 'PUT');
      const verifyStatus = async (res, showOnlyError = false) => {
        if (res && res.message) {
          if (res.status >= 100 && res.status <= 199 && !showOnlyError)
            return await MySwal.fire('Información', res.message, 'info');
          else if (res.status >= 200 && res.status <= 299 && !showOnlyError)
            return await MySwal.fire('¡Éxito!', res.message, 'success');
          else if (res.status >= 400 && res.status <= 499 && !showOnlyError)
            return await MySwal.fire('¡Error!', res.message, 'error');
          else if (res.status >= 500 && res.status <= 599)
            return await MySwal.fire('¡Error del servidor!', res.message, 'error');
        }
      }
      const loadNewData = () => {
        setDataIDS({});
        setTitleSwal('Cargando los nuevos datos...');
      };
      const changeStatusAndVerifyStatus = async () => changeStatusHotel().then(res => verifyStatus(res, true).then(() => changeStatusMunicipalHotel().then(() => verifyStatus(res).then(() => loadNewData()))));
      openSwal([changeStatusAndVerifyStatus,]);
    } else if (titleSwal === 'Cargando los nuevos datos...') fetchData().then(() => setTitleSwal(''));
  }, [titleSwal, dataIds]);

  return (
    <>
      <nav className="navbar navbar-expand-lg container">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Hoteles Decameron</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                  data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false"
                  aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <button type="button" className="btn btn-primary ms-auto d-block w-25 fw-bold text-uppercase"
                    data-bs-toggle="modal"
                    data-bs-target={`#submitModal`}>Crear Hotel
            </button>
          </div>
        </div>
      </nav>
      <div className="container-fluid container-md mt-3 table-responsive">
        <table className="table table-striped text-center caption-top">
          <caption><h1>Hoteles</h1></caption>
          <thead className="table-light">
          <tr>
            <th scope="col">Hotel</th>
            <th scope="col">Municipio</th>
            <th scope="col">Dirección</th>
            <th scope="col">Cantidad de habitaciones</th>
            <th scope="col">Acciones</th>
          </tr>
          </thead>
          <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <th scope="row">{item['hotel'].name}</th>
              <td>{item['municipality'].name}</td>
              <td>{item.address}</td>
              <td>{item.number_rooms}</td>
              <td>
                <div className="d-flex gap-3 justify-content-center align-items-center">
                  <button
                    className={'btn ' + (item.status ? 'btn-danger' : 'btn-primary')}
                    onClick={() => handleChangeStatus(item.id, item.hotel_id)}
                  >
                    {item.status ? <i className="bi bi-trash"></i>

                      : <i className="bi bi-check-lg"></i>}
                  </button>
                  {item.status ?
                    <>
                      <button
                        className="btn btn-warning"
                        data-bs-toggle="modal"
                        data-bs-target={`#updateModal`} onClick={() => {
                        setFormData({
                          name: item['hotel']?.name,
                          nit: item['hotel']?.nit,
                          hotel_id: item.hotel_id,
                          department_id: item['municipality'].department_id,
                          municipality_id: item['municipality'].id,
                          address: item.address,
                          number_rooms: item.number_rooms
                        });
                      }
                      }
                      >
                        <i className="bi bi-pencil-fill"></i>
                      </button>
                      <Modal
                        modalId={'updateModal'}
                        item={formData}
                        handleFormChange={handleFormChange}
                        handleUpdate={handleUpdate}
                        departments={departments}
                        municipalities={municipalities}
                      />
                    </> : ''}
                </div>
              </td>
            </tr>))}
          </tbody>
        </table>
        <Modal
          modalId={'submitModal'}
          item={formData}
          handleFormChange={handleFormChange}
          handleUpdate={handleFormSubmit}
          departments={departments}
          municipalities={municipalities}
        />
      </div>
    </>
  );
}

export default App;
