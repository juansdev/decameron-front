import React from 'react';
import ModalComponent from "../Modal/Modal";

const CrudTable = ({
                     data,
                     handleChangeStatus,
                     setFormData,
                     formData,
                     handleFormChange,
                     handleUpdate,
                     handleFormSubmit,
                     view,
                     setView,
                     departments,
                     municipalities,
                     roomTypes,
                     roomAccommodations,
                     setDataIDS,
                     municipal_hotel_id
                   }) => {
  if (view === 'municipalHotels')
    return (
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
                      <button
                        className="btn btn-success d-block fw-bold text-uppercase" onClick={() => {
                        setDataIDS({id: item.id, hotel_id: item.hotel_id});
                        setView('rooms');
                      }}
                      >
                        Listar las habitaciones del Hotel
                      </button>
                      <ModalComponent
                        modalID={'updateModal'}
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
          modalID={'submitModal'}
          item={formData}
          handleFormChange={handleFormChange}
          handleUpdate={handleFormSubmit}
          departments={departments}
          municipalities={municipalities}
        />
      </div>);
  else return (
    <div className="container-fluid container-md mt-3 table-responsive">
      <table className="table table-striped text-center caption-top">
        <caption><h1>Habitaciones</h1></caption>
        <thead className="table-light">
        <tr>
          <th scope="col">Hotel</th>
          <th scope="col">Tipo de habitación</th>
          <th scope="col">Acomodación de habitación</th>
          <th scope="col">Acciones</th>
        </tr>
        </thead>
        <tbody>
        {data.map((item) => (
          <tr key={item.id}>
            <th scope="row">{item['municipal_hotel']['hotel'].name}</th>
            <td>{item['room_type'].name}</td>
            <td>{item['room_accommodation'].name}</td>
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
                      data-bs-target={`#updateRoomModal`} onClick={() => {
                      setFormData({
                        id: item.id,
                        municipal_hotel_id,
                        room_type_id: item['room_type']?.id,
                        room_accommodation_id: item['room_accommodation']?.id
                      });
                    }
                    }
                    >
                      <i className="bi bi-pencil-fill"></i>
                    </button>
                    <ModalComponent
                      modalID={'updateRoomModal'}
                      item={formData}
                      handleFormChange={handleFormChange}
                      handleUpdate={handleUpdate}
                      roomTypes={roomTypes}
                      roomAccommodations={roomAccommodations}
                    />
                  </> : ''}
              </div>
            </td>
          </tr>))}
        </tbody>
      </table>
      <ModalComponent
        modalID={'submitRoomModal'}
        item={formData}
        handleFormChange={handleFormChange}
        handleUpdate={handleFormSubmit}
        roomTypes={roomTypes}
        roomAccommodations={roomAccommodations}
      />
    </div>);
};

CrudTable.propTypes = {};

CrudTable.defaultProps = {};

export default CrudTable;
