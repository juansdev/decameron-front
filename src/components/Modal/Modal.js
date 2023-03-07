import React from 'react';

const Modal = ({
                 modalID,
                 item,
                 handleFormChange,
                 handleUpdate,
                 departments,
                 municipalities,
                 roomTypes,
                 roomAccommodations
               }) => {
  if (item.department_id !== undefined && municipalities !== undefined && item.department_id !== '' && !municipalities.length)
    handleFormChange({target: {name: 'department_id', value: item.department_id}});
  if (['submitModal', 'updateModal'].includes(modalID))
    return (
      <div
        className="modal fade"
        id={modalID}
        tabIndex="-1"
        aria-labelledby={`${modalID}Label`}
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5
                className="modal-title"
                id={`${modalID}Label`}
              >
                {modalID === 'updateModal' ? 'Actualizar' : 'Crear'} Hotel
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id={`updateName-${item.id}`}
                    name="name"
                    value={item.name}
                    onChange={(event) =>
                      handleFormChange(event)
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="nit" className="form-label">
                    NIT
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id={`updateNIT-${item.id}`}
                    name="nit"
                    value={item.nit}
                    onChange={(event) =>
                      handleFormChange(event)
                    }
                  />
                </div>
                <div className="mb-3">
                  <select className="form-select" aria-label="Lista de departamentos" name="department_id"
                          value={item.department_id}
                          id={`updateDepartment-${item.id}`}
                          onChange={(event) =>
                            handleFormChange(event, item.id)
                          }>
                    <option value="">Seleccione un departamento</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>{department.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <select disabled={municipalities.length ? null : true} value={item.municipality_id}
                          className="form-select"
                          aria-label="Lista de departamentos" name="municipality_id"
                          id={`updateMunicipality-${item.id}`}
                          onChange={(event) =>
                            handleFormChange(event, item.id)
                          }>
                    <option value="">Seleccione un municipio</option>
                    {municipalities.map((municipality) => (
                      <option key={municipality.id} value={municipality.id}>{municipality.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="address" className="form-label">
                    Dirección del Hotel
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id={`updateAddress-${item.id}`}
                    name="address"
                    value={item.address}
                    onChange={(event) =>
                      handleFormChange(event, item.id)
                    }
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="number_rooms" className="form-label">
                    Número de habitaciones
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id={`updateNumberRooms-${item.id}`}
                    name="number_rooms"
                    value={item.number_rooms}
                    onChange={(event) =>
                      handleFormChange(event, item.id)
                    }
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleUpdate(item.id, item.hotel_id)}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>);
  else
    return (
      <div
        className="modal fade"
        id={modalID}
        tabIndex="-1"
        aria-labelledby={`${modalID}Label`}
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5
                className="modal-title"
                id={`${modalID}Label`}
              >
                {modalID === 'updateRoomModal' ? 'Actualizar' : 'Crear'} Habitación de Hotel
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <select value={item.room_type_id}
                          className="form-select"
                          aria-label="Lista de tipo de habitaciones" name="room_type_id"
                          id={`updateRoomType-${item.id}`}
                          onChange={(event) =>
                            handleFormChange(event, item.id)
                          }>
                    <option value="">Seleccione un tipo de habitación</option>
                    {roomTypes.map((roomType) => (
                      <option key={roomType.id} value={roomType.id}>{roomType.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <select value={item.room_accommodation_id}
                          className="form-select"
                          aria-label="Lista de acomodaciones de habitaciones" name="room_accommodation_id"
                          id={`updateRoomAccommodation-${item.id}`}
                          onChange={(event) =>
                            handleFormChange(event, item.id)
                          }>
                    <option value="">Seleccione un acomodación de habitación</option>
                    {roomAccommodations.map((roomAccommodation) => (
                      <option key={roomAccommodation.id} value={roomAccommodation.id}>{roomAccommodation.name}</option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleUpdate(item.id)}
              >
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      </div>)
      ;
};

export default Modal;