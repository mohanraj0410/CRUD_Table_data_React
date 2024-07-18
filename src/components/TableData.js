import React, { useEffect, useRef, useState } from 'react';
import { DeleteFilled, EditFilled, SearchOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Space, Table, message } from 'antd';
import Highlighter from 'react-highlight-words';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Search from 'antd/es/input/Search';



const Tabledata = () => {

    const [tableData, setTableData] = useState([])
    const [isEditing, setIsEditing] = useState(false)
    const [editUserData, setEditUserData] = useState("")
    const [isAddUser, setIsAddUser] = useState(false)
    const [addUserData, setAddUserData] = useState({
        id: "",
        name: "",
        email: "",
        phoneNumber: "",
        age: ""
    })

    const tableDataWithKeys = tableData.map((item, index) => ({
        ...item,
        key: index
    }))

    const fetchData = async () => {
        // console.log("fetchdata")
        let data = await axios.get("http://localhost:8000/users")
        return setTableData(data.data)
    }

    useEffect(() => {
        // console.log("useeffect")
        fetchData()
    }, [isAddUser, isEditing])


    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        // console.log("handleReset")
        clearFilters();
        setSearchText('');
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({
                                closeDropdown: false,
                            });
                            setSearchText(selectedKeys[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{
                        backgroundColor: '#ffc069',
                        padding: 0,
                    }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const handleAddUser = () => {
        // console.log("handleAddUser")
        setIsAddUser(true)
    }

    const editUser = (record) => {
        // console.log("editUser")
        setIsEditing(true)
        setEditUserData({ ...record })
    }

    const deleteUser = (record) => {
        // console.log("deleteUser")
        Modal.confirm({
            title: "Are you sure, you want to delete this User?",
            onOk: () => {
                axios.delete("http://localhost:8000/users/" + record.id)
                // .then(res => console.log(res))
                setTableData((prev) => {
                    return prev.filter(user => user.id !== record.id)
                })
                message.open({
                    type: 'success',
                    content: 'Deleted Successfully',
                });
            }
        })

    }

    const columns = [
        {
            title: 'S.No',
            dataIndex: 'id',
            key: 'id',
            render: (text, record, index) => index + 1,
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ...getColumnSearchProps('email'),
        },
        {
            title: 'Phone No',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
            ...getColumnSearchProps('phoneNumber'),
        },
        {
            title: 'Age',
            dataIndex: 'age',
            key: 'age',
            sorter: (a, b) => a.age - b.age,
            ...getColumnSearchProps('age'),
        },
        {
            title: 'Action',
            key: 'action',
            render: (record) => {
                return (
                    <>
                        <EditFilled onClick={() => editUser(record)} style={{ color: "green", marginRight: "12px", cursor: "pointer" }} />
                        <DeleteFilled onClick={() => deleteUser(record)} style={{ color: "red", cursor: "pointer" }} />
                    </>
                )
            }
        },
    ];

    const resetEditing = () => {
        // console.log("resetEditing")
        setIsEditing(false)

    }
    // console.log(uuidv4())

    const handleSubmit = () => {
        // console.log("handleSubmit")
        message.open({
            type: 'success',
            content: 'Student Added Successfully',
        });
        return (
            axios.post("http://localhost:8000/users", { ...addUserData })
                // .then(response => console.log(response))

                .catch(err => console.log(err))
        )
    }

    const { name, email, phoneNumber, age } = addUserData

    let addUserDataVal = name && email && phoneNumber && age

    const onSearchUser = (value, _e, info) => {
        if (value) {
            let filteredData = tableData.filter(data => {
                return (
                    data.name.toLowerCase().includes(value.toLowerCase()) ||
                    data.email.toLowerCase().includes(value.toLowerCase())
                );
            });
            setTableData(filteredData);
        }
        else {
            message.open({
                type: 'warning',
                content: 'Please, Enter your value',
            });
        }
    };



    return (
        <>
            <div className='header'>
                <Button
                    onClick={handleAddUser}
                    type="primary"
                    style={{
                        marginBottom: 16,
                    }}
                >
                    Add a new User
                </Button>

                <Search style={{ width: 300 }} placeholder="input search text" onSearch={onSearchUser} enterButton />

            </div>
            <Table columns={columns} dataSource={tableDataWithKeys} size='middle'
                showSorterTooltip={{
                    target: 'sorter-icon',
                }} />

            <Modal
                title="Add New User"
                open={isAddUser}
                okText="Add"
                onCancel={() => {
                    setIsAddUser(false)
                }}
                onOk={() => {
                    if (addUserDataVal) {
                        setIsAddUser(false)
                        handleSubmit()
                        setAddUserData({})
                    }
                    else {
                        message.open({
                            type: 'warning',
                            content: 'Please enter the Details',
                        });
                    }
                }}
            >
                <Form>

                    <Form.Item label="Name" >
                        <Input onChange={(e) => setAddUserData((prev) => {
                            return (
                                { ...prev, name: e.target.value, id: uuidv4().substring(0, 4) }
                            )
                        })}
                            type='text'
                            value={addUserData.name} />
                    </Form.Item>

                    <Form.Item label="Email" >
                        <Input onChange={(e) => setAddUserData((prev) => {
                            return (
                                { ...prev, email: e.target.value }
                            )
                        })}
                            type='email'
                            value={addUserData.email} />
                    </Form.Item>

                    <Form.Item label="Phone No">
                        <Input onChange={(e) => setAddUserData((prev) => {
                            return (
                                { ...prev, phoneNumber: e.target.value }
                            )
                        })}
                            type='number'
                            value={addUserData.phoneNumber} />
                    </Form.Item>

                    <Form.Item label="Age" >
                        <Input onChange={(e) => setAddUserData((prev) => {
                            return (
                                { ...prev, age: e.target.value }
                            )
                        })}
                            type='number'
                            value={addUserData.age} />
                    </Form.Item>

                </Form>

            </Modal >

            <Modal
                title="Edit User Details"
                open={isEditing}
                okText="Save"
                onCancel={() => {
                    resetEditing()
                }}
                onOk={() => {
                    setTableData(pre => {
                        return pre.map(user => {
                            if (user.id === editUserData.id) {
                                message.open({
                                    type: 'success',
                                    content: 'Edited User details Successfully',
                                });
                                return (
                                    axios.put("http://localhost:8000/users/" + editUserData.id, { ...editUserData })
                                    // .then(window.location.reload())
                                )

                            }
                            else {
                                return user
                            }
                        })
                    })
                    resetEditing()
                }}
            >
                <Form>
                    <Form.Item label="Name" >
                        <Input onChange={(e) => setEditUserData((prev) => {
                            return (
                                { ...prev, name: e.target.value }
                            )
                        })}
                            type='text'
                            value={editUserData.name} />
                    </Form.Item>

                    <Form.Item label="Email" >
                        <Input onChange={(e) => setEditUserData((prev) => {
                            return (
                                { ...prev, email: e.target.value }
                            )
                        })}
                            type='email'
                            value={editUserData.email} />
                    </Form.Item>

                    <Form.Item label="Phone No">
                        <Input onChange={(e) => setEditUserData((prev) => {
                            return (
                                { ...prev, phoneNumber: e.target.value }
                            )
                        })}
                            type='number'
                            value={editUserData.phoneNumber} />
                    </Form.Item>

                    <Form.Item label="Age" >
                        <Input onChange={(e) => setEditUserData((prev) => {
                            return (
                                { ...prev, age: e.target.value }
                            )
                        })}
                            type='number'
                            value={editUserData.age} />
                    </Form.Item>

                </Form>

            </Modal >
        </>
    );
};
export default Tabledata;

