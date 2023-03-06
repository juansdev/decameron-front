import React, {useState, useEffect} from "react";
import Modal from './components/Modal/Modal';

const apiUrl = process.env.REACT_APP_API_URL;

function App() {
    const [data, setData] = useState([]);
    const [setFormErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        nit: ''
    });

    async function consumeAPI(url, method, data=undefined) {
        return await fetch(url, {
            method,
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data ? JSON.stringify(data) : undefined
        }).then(response => response.json()).catch(error => console.error(error));
    }

    const fetchData = async () => {
        const response = await consumeAPI(`${apiUrl}/municipal-hotels`, 'GET');
        setData(response.data);
    };

    const handleFormChange = (event) => {
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        });
    };

    const validateFormData = async () => {
        const errors = {};
        if (!formData.name.trim())
            errors.name = "El nombre es requerido";
        if (!formData.nit.trim())
            errors.nit = "El NIT es requerido";
        if (Object.keys(errors).length === 0) {
            try {
                const response = await consumeAPI(`${apiUrl}/municipal-hotels`, "POST", formData);
                if (response.ok) {
                    setFormErrors({});
                    alert(response.message);
                }
                throw new Error(response.message);
            } catch (error) {
                alert(error.message);
            }
        } else {
            setFormErrors(errors);
        }
    };

    const handleFormSubmit = async () => {
        await validateFormData();
        await consumeAPI(`${apiUrl}/municipal-hotels`, 'POST', formData);
        setFormData({name: "", nit: ""});
        await fetchData();
    };

    const handleDelete = async (id) => {
        await consumeAPI(`${apiUrl}/${id}/status`, 'PUT');
        await fetchData();
    };

    const handleUpdate = async (id, newData) => {
        await consumeAPI(`${apiUrl}/${id}`, 'PUT', newData);
        await validateFormData();
        await fetchData();
    };

    useEffect(() => {
        fetchData().then(r => r);
    }, []);

    return (
        <div className="container mt-3">
            <button type="button" className="btn btn-primary ms-auto d-block w-25 fw-bold text-uppercase"
                    data-bs-toggle="modal"
                    data-bs-target={`#submitModal`}>Crear Hotel
            </button>
            <div>
                <h1>Hoteles</h1>
                <table className="table table-striped">
                    <thead>
                    <tr>
                        <th>Hotel ID</th>
                        <th>Municipio ID</th>
                        <th>Dirección</th>
                        <th>Numero de habitaciones</th>
                    </tr>
                    </thead>
                    <tbody>
                    {data.map((item) => (
                        <tr key={item.id}>
                            <td>{item.name}</td>
                            <td>{item.nit}</td>
                            <td>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    Eliminar
                                </button>
                                <button
                                    className="btn btn-primary"
                                    data-bs-toggle="modal"
                                    data-bs-target={`#updateModal-${item.id}`}
                                >
                                    Actualizar
                                </button>
                                <Modal
                                    modalId={'updateModal'}
                                    item={item}
                                    handleFormChange={handleFormChange}
                                    handleUpdate={handleUpdate}
                                />
                            </td>
                        </tr>))}
                    </tbody>
                </table>
            </div>
            <Modal
                modalId={'submitModal'}
                item={formData}
                handleFormChange={handleFormChange}
                handleUpdate={handleFormSubmit}
            />
        </div>
    );
}

export default App;
