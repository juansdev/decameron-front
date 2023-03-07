import React, {useEffect, useState} from "react";
import ModalComponent from './components/Modal/Modal';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import {Modal} from 'bootstrap';

function App() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const MySwal = withReactContent(Swal);
  const [CSRF, setCSRF] = useState('');
  const [titleSwal, setTitleSwal] = useState('');
  const [dataIds, setDataIDS] = useState({});
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

  const removeBugModals = () => {
    for (const elementBackDrop of document.getElementsByClassName('modal-backdrop')) {
      elementBackDrop.remove();
    }
  };
  const openSwal = async ({callbackAPIs, mode, response, showOnlyError}) => {
    if (mode === 'loading') return await MySwal.fire({
      title: titleSwal,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: async () => {
        MySwal.showLoading();
        return await Promise.all(callbackAPIs.map(async (callbackAPI) => await callbackAPI())).then(() => MySwal.close());
      }
    });
    else if (mode === 'verifyStatus' && (response && response.message)) {
      const options = {
        html: response.errors ? Object.values(response.errors).reduce((errors, currentError) => errors + currentError.reduce((specificErrors, currentSpecificError) => specificErrors + `<div>${currentSpecificError}</div>`, ''), '') : response.message,
        confirmButtonText: 'Aceptar'
      };
      let successStatus = false;
      if (response.status >= 100 && response.status <= 199) {
        successStatus = true;
        options['title'] = 'Información';
        options['icon'] = 'info';
      } else if (response.status >= 200 && response.status <= 299) {
        successStatus = true;
        options['title'] = '¡Éxito!';
        options['icon'] = 'success';
      } else if (response.status >= 400 && response.status <= 499) {
        successStatus = false;
        options['title'] = '¡Error!';
        options['icon'] = 'error';
      } else if (response.status >= 500 && response.status <= 599) {
        successStatus = false;
        options['title'] = '¡Error del servidor!';
        options['icon'] = 'error';
      }
      if ((showOnlyError && !successStatus) || !showOnlyError) return await MySwal.fire(options).then(() => options['icon']);
      else return options['icon'];
    }
  }
  const openSwalVerifyStatus = (response, showOnlyError = false) => openSwal({
    response,
    showOnlyError,
    mode: 'verifyStatus'
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
    return await openSwal({callbackAPIs: [updateData], mode: 'loading'});
  };
  const listDepartments = async () => {
    const response = await consumeAPI(`${apiUrl}/api/departments`, 'GET');
    setDepartments(response.data);
  };

  const updateFormData = ({key, value, resetData}) => {
    const updateFormData = JSON.parse(JSON.stringify(formData));
    if (key && value !== undefined && updateFormData[key] !== value)
      updateFormData[key] = value;
    else if (resetData) {
      for (const key in formData) {
        updateFormData[key] = '';
      }
      setMunicipalities([]);
    }
    setFormData(updateFormData);
  };
  const updateMunicipalHotelAndHotel = async (method, id = undefined, hotel_id = undefined) => {
    const errors = {};
    if (!formData.name.trim())
      errors.name = "El nombre es obligatorio";
    if (!formData.nit.trim())
      errors.nit = "El NIT es obligatorio";
    if (formData.department_id === '')
      errors.department_id = "El departamento es obligatorio";
    if (formData.municipality_id === '')
      errors.municipality_id = "El municipio es obligatorio";
    if (formData.address === '')
      errors.address = "La dirección es obligatoria";
    if (formData.number_rooms === '')
      errors.number_rooms = "El número de habitaciones es obligatorio";
    if (Object.keys(errors).length !== 0) {
      const response = {
        message: Object.values(errors).reduce((message, currentMessage) => message + `<div>${currentMessage}</div>`, ''),
        status: 400
      };
      await openSwalVerifyStatus(response);
    } else {
      setDataIDS({id, hotel_id});
      setTitleSwal((method === 'PUT' ? 'Actualizando' : 'Agregando') + ' los datos del Hotel');
    }
  };
  const handleFormChange = async (event) => {
    const {name, value} = event.target;
    if (name === 'department_id' && (formData.department_id !== value || !municipalities.length)) {
      if (value) {
        const response = await consumeAPI(`${apiUrl}/api/municipalities?department_id=${value}`, 'GET');
        setMunicipalities(response.data);
      } else setMunicipalities([]);
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
      openSwal({callbackAPIs: [getCSRF], mode: 'loading'});
    } else if (titleSwal === 'Cargando los datos...') listDepartments().then(async () => {
      await fetchData();
      setTitleSwal('');
    })
    else if (Object.keys(dataIds).length && ['Actualizando los datos del Hotel', 'Agregando los datos del Hotel', 'Actualizando el estado del Hotel...'].includes(titleSwal)) {
      const {id, hotel_id} = dataIds;
      if (['Actualizando los datos del Hotel', 'Agregando los datos del Hotel'].includes(titleSwal)) {
        const {name, nit, address, number_rooms, municipality_id} = formData;
        let data = {
          name,
          nit
        };
        const method = titleSwal === 'Actualizando los datos del Hotel' ? 'PUT' : 'POST';
        const createOrUpdateHotel = async () => await consumeAPI(`${apiUrl}/hotels` + (method === 'PUT' ? `/${hotel_id}` : ''), method, data).then((response) => openSwalVerifyStatus(response, true).then(async (statusResponse) => {
          if (statusResponse === 'success') {
            data = {'hotel_id': response['data'].id, municipality_id, address, number_rooms};
            await consumeAPI(`${apiUrl}/municipal-hotels` + (method === 'PUT' ? `/${id}` : ''), method, data).then((response) => openSwalVerifyStatus(response).then((statusResponse) => {
              if (statusResponse === 'success') {
                updateFormData({resetData: true});
                const modalId = method === 'PUT' ? 'updateModal' : 'submitModal';
                const myModalEl = document.getElementById(modalId);
                const myModal = Modal.getInstance(myModalEl);
                myModal.hide();
                removeBugModals();
              }
            }));
          }
          setTitleSwal('Cargando los nuevos datos...');
        }));
        openSwal({callbackAPIs: [createOrUpdateHotel], mode: 'loading'});
      } else if (titleSwal === 'Actualizando el estado del Hotel...') {
        const changeStatusHotel = async () => await consumeAPI(`${apiUrl}/hotels/${hotel_id}/status`, 'PUT');
        const changeStatusMunicipalHotel = async () => await consumeAPI(`${apiUrl}/municipal-hotels/${id}/status`, 'PUT');
        const changeStatusAndVerifyStatus = async () => await changeStatusHotel().then(response => openSwalVerifyStatus(response, true).then(async (statusResponse) => {
          if (statusResponse === 'success')
            await changeStatusMunicipalHotel().then(() => openSwalVerifyStatus(response));
          setTitleSwal('Cargando los nuevos datos...');
        }));
        openSwal({callbackAPIs: [changeStatusAndVerifyStatus], mode: 'loading'});
      }
    } else if (titleSwal === 'Cargando los nuevos datos...') fetchData().then(() => {
      setDataIDS({});
      setTitleSwal('');
    });
  }, [titleSwal, dataIds]);

  return (
    <>
      <nav className="navbar navbar-expand-lg container">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Decameron</a>
          <button type="button" data-bs-target={`#submitModal`} onClick={() => {
            setFormData({
              id: '',
              name: '',
              nit: '',
              hotel_id: '',
              department_id: '',
              municipality_id: '',
              address: '',
              number_rooms: ''
            });
            removeBugModals();
          }
          } className="btn btn-primary ms-auto d-block w-25 fw-bold text-uppercase"
                  data-bs-toggle="modal">Crear Hotel
          </button>
        </div>
      </nav>
      <div className="container-fluid container-md mt-3 table-responsive">
        <table className="table table-striped text-center caption-top">
          <caption><h1>Hoteles</h1></caption>
          <thead className="table-light">
          <tr>
            <th scope="col">Hotel</th>
            <th scope="col">Municipio</th>
            <th scope="col">NIT</th>
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
              <td>{item['hotel'].nit}</td>
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
                          id: item.id,
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
                      <ModalComponent
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
        <ModalComponent
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
