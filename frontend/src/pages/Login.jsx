import React,
{
  useState
}
from 'react';
import {
  useNavigate
}
from 'react-router-dom';
import {
  useAuth
}
from '../contexts/AuthContext';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const {
    login
  } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      });
      login(response.data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to login. Please check your credentials.');
      console.error(err);
    }
  };

  return ( <
    div >
    <
    h2 > Login < /h2> <
    form onSubmit = {
      handleSubmit
    } >
    <
    div >
    <
    label > Email: < /label> <
    input type = "email"
    value = {
      email
    }
    onChange = {
      (e) => setEmail(e.target.value)
    }
    required / >
    <
    /div> <
    div >
    <
    label > Password: < /label> <
    input type = "password"
    value = {
      password
    }
    onChange = {
      (e) => setPassword(e.target.value)
    }
    required / >
    <
    /div> {
      error && < p style = {
          {
            color: 'red'
          }
        } > {
          error
        } < /p>} <
        button type = "submit" > Login < /button> <
        /form> <
        /div>
    );
  }

  export default Login;