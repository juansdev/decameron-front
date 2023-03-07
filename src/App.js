import React, {useEffect, useState} from "react";
import {Modal} from 'bootstrap';
import CrudTable from "./components/CRUDTable/CRUDTable";
import {
  consumeAPI,
  openSwal,
  openSwalVerifyStatus,
  removeBugModals,
  updateFormData
} from "./assets/common/js/functions";
import RoomComponent from "./pages/Room/RoomComponent";

function App() {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [CSRF, setCSRF] = useState('');
  const [view, setView] = useState('municipalHotels');

  const [titleSwal, setTitleSwal] = useState('');
  const [dataIDS, setDataIDS] = useState({});
  const [data, setData] = useState([]);
  const [roomData, setRoomData] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomAccommodations, setRoomAccommodations] = useState([]);
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

  const fetchData = async () => {
    const updateData = async () => {
      const response = await consumeAPI(CSRF, `${apiUrl}/municipal-hotels`, 'GET');
      setData(response.data);
      return response;
    };
    return await openSwal({titleSwal, callbackAPIs: [updateData], mode: 'loading'});
  };
  const listDepartments = async () => {
    const response = await consumeAPI(CSRF, `${apiUrl}/api/departments`, 'GET');
    setDepartments(response.data);
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
    if (formData.number_rooms < 1)
      errors.number_rooms = "El mínimo de habitaciones es de 1";
    if (formData.number_rooms > 7)
      errors.number_rooms = "El máximo de habitaciones es de 7";
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
        const response = await consumeAPI(CSRF, `${apiUrl}/api/municipalities?department_id=${value}`, 'GET');
        setMunicipalities(response.data);
      } else setMunicipalities([]);
    }
    updateFormData({formData, setFormData, key: name, value});
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
      const getCSRF = () => consumeAPI(CSRF, `${apiUrl}/CSRF`, 'GET').then(async res => {
        const {csrf} = res;
        setCSRF(csrf);
        setTitleSwal('Cargando los datos...');
      });
      openSwal({titleSwal, callbackAPIs: [getCSRF], mode: 'loading'});
    } else if (titleSwal === 'Cargando los datos...') listDepartments().then(async () => {
      await fetchData();
      setTitleSwal('');
    });
    else if (Object.keys(dataIDS).length && ['Actualizando los datos del Hotel', 'Agregando los datos del Hotel', 'Actualizando el estado del Hotel...'].includes(titleSwal)) {
      const {id, hotel_id} = dataIDS;
      if (['Actualizando los datos del Hotel', 'Agregando los datos del Hotel'].includes(titleSwal)) {
        const {name, nit, address, number_rooms, municipality_id} = formData;
        let data = {
          name,
          nit
        };
        const method = titleSwal === 'Actualizando los datos del Hotel' ? 'PUT' : 'POST';
        const createOrUpdateHotel = async () => await consumeAPI(CSRF, `${apiUrl}/hotels` + (method === 'PUT' ? `/${hotel_id}` : ''), method, data).then((response) => openSwalVerifyStatus(response, true).then(async (statusResponse) => {
          if (statusResponse === 'success') {
            data = {'hotel_id': response['data'].id, municipality_id, address, number_rooms};
            await consumeAPI(CSRF, `${apiUrl}/municipal-hotels` + (method === 'PUT' ? `/${id}` : ''), method, data).then((response) => openSwalVerifyStatus(response).then((statusResponse) => {
              if (statusResponse === 'success') {
                updateFormData({
                  formData,
                  setFormData,
                  resetData: true,
                  additionalResetData: () => setMunicipalities([])
                });
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
        openSwal({titleSwal, callbackAPIs: [createOrUpdateHotel], mode: 'loading'});
      } else if (titleSwal === 'Actualizando el estado del Hotel...') {
        const changeStatusHotel = async () => await consumeAPI(CSRF, `${apiUrl}/hotels/${hotel_id}/status`, 'PUT');
        const changeStatusMunicipalHotel = async () => await consumeAPI(CSRF, `${apiUrl}/municipal-hotels/${id}/status`, 'PUT');
        const changeStatusAndVerifyStatus = async () => await changeStatusHotel().then(response => openSwalVerifyStatus(response, true).then(async (statusResponse) => {
          if (statusResponse === 'success')
            await changeStatusMunicipalHotel().then(response => openSwalVerifyStatus(response));
          setTitleSwal('Cargando los nuevos datos...');
        }));
        openSwal({titleSwal, callbackAPIs: [changeStatusAndVerifyStatus], mode: 'loading'});
      }
    } else if (titleSwal === 'Cargando los nuevos datos...') fetchData().then(() => {
      setDataIDS({});
      setTitleSwal('');
    });
  }, [titleSwal, dataIDS]);

  return (
    <>
      {view === 'municipalHotels' ? <>
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
          <CrudTable data={data} handleChangeStatus={handleChangeStatus} setFormData={setFormData} formData={formData}
                     handleFormChange={handleFormChange} handleUpdate={handleUpdate} departments={departments}
                     municipalities={municipalities} handleFormSubmit={handleFormSubmit} view={view} setView={setView}
                     setDataIDS={setDataIDS}></CrudTable>
        </> :
        <RoomComponent CSRF={CSRF} apiUrl={apiUrl} view={view} municipalHotels={data}
                       municipal_hotel_id={dataIDS['id']} setView={setView} data={roomData} setData={setRoomData}
                       roomTypes={roomTypes} setRoomTypes={setRoomTypes} roomAccommodations={roomAccommodations}
                       setRoomAccommodations={setRoomAccommodations}></RoomComponent>}
    </>
  );
}

export default App;
