import React from 'react';

const Modal = ({ modalId, item, handleFormChange, handleUpdate }) => (
    <div
        className="modal fade"
        id={`${modalId}${item.id?`-${item.id}`:''}`}
        tabIndex="-1"
        aria-labelledby={`${modalId}Label${item.id?`-${item.id}`:''}`}
        aria-hidden="true"
    >
        <div className="modal-dialog">
            <div className="modal-content">
                <div className="modal-header">
                    <h5
                        className="modal-title"
                        id={`${modalId}Label${item.id?`-${item.id}`:''}`}
                    >
                        {modalId==='updateModal'?'Actualizar':'Crear'} Hotel
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
                                    handleFormChange(event, item.id)
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
                        onClick={() =>
                            handleUpdate(item.id, {
                                name: document.querySelector(
                                    `#updateName-${item.id}`
                                ).value,
                                nit: document.querySelector(
                                    `#updateNIT-${item.id}`
                                ).value
                            })
                        }
                    >
                        Guardar cambios
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default Modal;