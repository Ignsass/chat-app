import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { RxPerson, RxEyeOpen, RxEyeClosed } from "react-icons/rx";
import { FiLock } from "react-icons/fi";
import axios from "axios";
import { loginRoute } from "../../utils/APIRoutes";
import { toastOptions } from "../../utils/constants";
import { ChatState } from "../../context/ChatProvider"; // Tinkamas importas

function Login({ isActive }) {
  const navigate = useNavigate();
  const [values, setValues] = useState({ username: "", password: "" });
  const [show, setShow] = useState(false);

  const { setSelectedChat, setChats } = ChatState(); // Naudojame ChatState prieigai prie būsenos

  const handleChange = (event) => {
    setValues({ ...values, [event.target.name]: event.target.value });
  };

  const validateForm = () => {
    const { username, password } = values;
    if (username === "" || password === "") {
      toast.error("Username or Password is incorrect", toastOptions);
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validateForm()) {
      try {
        const config = { headers: { "Content-type": "application/json" } };
        const { username, password } = values;
        const { data } = await axios.post(loginRoute, { username, password }, config);

        if (!data.status) {
          toast.error(data.msg, toastOptions);
        } else {
          localStorage.clear();
          setChats([]); // Išvalome pokalbių sąrašą
          setSelectedChat(null); // Išvalome pasirinktą pokalbį

          localStorage.setItem(process.env.REACT_APP_LOCALHOST_KEY, JSON.stringify(data));
          navigate("/");
        }
      } catch (error) {
        toast.error(error.response?.data?.msg || "Login failed", toastOptions);
      }
    }
  };

  return (
    <>
      <div className="login-wrapper form-container">
        <form className="form login" onSubmit={handleSubmit}>
          <span className="title">Login</span>
          <div className="inputs">
            <div className="input-field">
              <input
                type="text"
                placeholder="Username"
                name="username"
                onChange={handleChange}
              />
              <RxPerson />
            </div>
            <div className="input-field">
              <input
                type={show ? "text" : "password"}
                placeholder="Password"
                name="password"
                onChange={handleChange}
              />
              <FiLock />
              {show ? (
                <RxEyeOpen className="password-icon" onClick={() => setShow(false)} />
              ) : (
                <RxEyeClosed className="password-icon" onClick={() => setShow(true)} />
              )}
            </div>
          </div>
          <div>
            <button type="submit" className="input-field button">Log In</button>
          </div>
          <div className="login-signup">
            <span className="text">
              Don't have an account? <button onClick={() => isActive('no')} className="login-link">Create One</button>
            </span>
          </div>
        </form>
      </div>
      <ToastContainer />
    </>
  );
}

export default Login;
