import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from '../components/Authorization/Login';
import Register from '../components/Authorization/Register';
import { ChatState } from '../context/ChatProvider'; // Import ChatState to access context

function Authorization() {
  const navigate = useNavigate();
  const [isLoginActive, setIsLoginActive] = useState('yes');
  const { resetState } = ChatState(); // Get resetState function from context

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) {
      // Reset chat state and navigate if a user is already logged in
      resetState(); // Ensure chat state is cleared
      navigate("/");
    }
  }, [navigate, resetState]);

  return (
    <>
      <div className='auth'>
        {isLoginActive === 'yes'
          ? <Login isActive={setIsLoginActive} />
          : <Register isLoginActive={setIsLoginActive} />
        }
      </div>
      <ToastContainer />
    </>
  );
}

export default Authorization;
