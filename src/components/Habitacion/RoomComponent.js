import React, {useEffect, useState} from 'react';
import {
  consumeAPI,
  openSwal,
  openSwalVerifyStatus,
  removeBugModals,
  updateFormData
} from "../../assets/common/js/functions";
import {Modal} from "bootstrap";
import CrudTable from "../CRUDTable/CRUDTable";

const RoomComponent = ({CSRF, apiUrl, view, municipal_hotel_id, setView}) => {
  const [titleSwal, setTitleSwal] = useState('');
  const [dataID, setDataID] = useState({});
  const [data, setData] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomAccommodations, setRoomAccommodations] = useState([]);
  const [formData, setFormData] = useState({
    id: '',
    room_type_id: '',
    room_accommodation_id: ''
  });

  const fetchData = async () => {
    const updateData = async () => {
      const response = await consumeAPI(CSRF, `${apiUrl}/rooms?municipal_hotel_id=${municipal_hotel_id}`, 'GET');
      setData(response.data);
      return response;
    };
    return await openSwal({titleSwal, callbackAPIs: [updateData], mode: 'loading'});
  };
  const listRoomTypes = async () => {
    const response = await consumeAPI(CSRF, `${apiUrl}/api/room-types`, 'GET');
    setRoomTypes(response.data);
  };
  const listRoomAccommodations = async () => {
    const response = await consumeAPI(CSRF, `${apiUrl}/api/room-accommodations`, 'GET');
    setRoomAccommodations(response.data);
  };

  const updateRoom = async (method, id = undefined) => {
    const errors = {};
    if (formData.room_type_id === '')
      errors.room_type_id = "El tipo de habitación es obligatorio";
    if (formData.room_accommodation_id === '')
      errors.room_accommodation_id = "La acomodación del cuarto es obligatorio";
    if (Object.keys(errors).length !== 0) {
      const response = {
        message: Object.values(errors).reduce((message, currentMessage) => message + `<div>${currentMessage}</div>`, ''),
        status: 400
      };
      await openSwalVerifyStatus(response);
    } else {
      setDataID({id});
      setTitleSwal((method === 'PUT' ? 'Actualizando' : 'Agregando') + ' los datos de la Habitación');
    }
  };
  const handleFormChange = async (event) => {
    const {name, value} = event.target;
    updateFormData({formData, setFormData, key: name, value});
  };
  const handleFormSubmit = async () => updateRoom('POST');
  const handleUpdate = async (id) => await updateRoom('PUT', id);
  const handleChangeStatus = async (id) => {
    setDataID({id});
    setTitleSwal('Actualizando el estado de la Habitación...');
  };

  useEffect(() => {
    setTitleSwal('Cargando los datos...');
  }, []);
  useEffect(() => {
    if (titleSwal === 'Cargando los datos...') listRoomTypes().then(async () => listRoomAccommodations().then(async () => {
      await fetchData();
      setTitleSwal('');
    }));
    else if (Object.keys(dataID).length && ['Actualizando los datos de la Habitación', 'Agregando los datos de la Habitación', 'Actualizando el estado de la Habitación...'].includes(titleSwal)) {
      const {id} = dataID;
      if (['Actualizando los datos de la Habitación', 'Agregando los datos de la Habitación'].includes(titleSwal)) {
        const {room_type_id, room_accommodation_id} = formData;
        let data = {
          municipal_hotel_id,
          room_type_id,
          room_accommodation_id
        };
        const method = titleSwal === 'Actualizando los datos de la Habitación' ? 'PUT' : 'POST';
        const createOrUpdateHotel = async () => await consumeAPI(CSRF, `${apiUrl}/rooms` + (method === 'PUT' ? `/${id}` : '') + `?$municipal_hotel_id=${municipal_hotel_id}`, method, data).then((response) => openSwalVerifyStatus(response).then(async (statusResponse) => {
          if (statusResponse === 'success') {
            updateFormData({
              formData,
              setFormData,
              resetData: true
            });
            const modalId = method === 'PUT' ? 'updateRoomModal' : 'submitRoomModal';
            const myModalEl = document.getElementById(modalId);
            const myModal = Modal.getInstance(myModalEl);
            myModal.hide();
            removeBugModals();
          }
          setTitleSwal('Cargando los nuevos datos...');
        }));
        openSwal({titleSwal, callbackAPIs: [createOrUpdateHotel], mode: 'loading'});
      } else if (titleSwal === 'Actualizando el estado de la Habitación...') {
        const changeStatusHotel = async () => await consumeAPI(CSRF, `${apiUrl}/rooms/${id}/status?$municipal_hotel_id=${municipal_hotel_id}`, 'PUT');
        const changeStatusAndVerifyStatus = async () => await changeStatusHotel().then(response => openSwalVerifyStatus(response).then(() => setTitleSwal('Cargando los nuevos datos...')));
        openSwal({titleSwal, callbackAPIs: [changeStatusAndVerifyStatus], mode: 'loading'});
      }
    } else if (titleSwal === 'Cargando los nuevos datos...') fetchData().then(() => {
      setDataID({});
      setTitleSwal('');
    });
  }, [titleSwal, dataID]);

  return (
    <>
      <nav className="navbar navbar-expand-lg container">
        <div className="container-fluid">
          <a className="navbar-brand" href="#">Decameron</a>
          <button type="button" data-bs-target={`#submitRoomModal`} onClick={() => {
            setFormData({
              id: '',
              room_type_id: '',
              room_accommodation_id: '',
              municipal_hotel_id,
            });
            removeBugModals();
          }
          } className="btn btn-primary ms-auto d-block w-25 fw-bold text-uppercase"
                  data-bs-toggle="modal">Crear Habitación de Hotel
          </button>
          <button
            className="ms-3 btn btn-success d-block fw-bold text-uppercase" onClick={() => setView('municipalHotels')}
          >
            Volver
          </button>
        </div>
      </nav>
      <CrudTable view={view} data={data} handleChangeStatus={handleChangeStatus} setFormData={setFormData}
                 formData={formData}
                 handleFormChange={handleFormChange} handleUpdate={handleUpdate}
                 handleFormSubmit={handleFormSubmit} roomTypes={roomTypes}
                 roomAccommodations={roomAccommodations} municipal_hotel_id={municipal_hotel_id}></CrudTable>
    </>
  );
};

RoomComponent.propTypes = {};

RoomComponent.defaultProps = {};

export default RoomComponent;
