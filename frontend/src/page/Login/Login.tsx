import { useState } from "react";
import { useFrappeAuth } from "frappe-react-sdk";
import toast from "react-hot-toast";

import Password from "../../component/form-elements/Password";
import Input from "../../component/form-elements/Input";
import Button from "../../component/form-elements/Button";
import { URL_DASHBOARD } from "../../router/router-link";
import { Navigate, useNavigate } from "react-router-dom";

const Login = () => {
  const { login, currentUser } = useFrappeAuth();
  console.log({ currentUser });

  const navigate = useNavigate();
  const [userNameOrMail, setUserNameOrMail] = useState("");
  const [password, setPassword] = useState("");
  const [userNameOrMailError, setUserNameOrMailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userNameOrMail) {
      setUserNameOrMailError("Please enter username or email");
    }
    if (!password) {
      setPasswordError("Please enter password");
    }
    if (userNameOrMail && password) {
      try {
        setLoading(true);
        await login({
          username: userNameOrMail,
          password: password,
        });
        setLoading(false);
        toast.success("Login successful");
        navigate(URL_DASHBOARD());
      } catch (error) {
        toast.error((error as Error).message);
        setLoading(false);
      }
    }
  };
  if (currentUser) {
    return <Navigate to={URL_DASHBOARD()} />;
  }

  return (
    <div
      className="h-screen w-full bg-cover bg-center flex items-center justify-center relative"
      style={{
        backgroundImage: `url('/assets/BG.jpg')`, // Replace with your image path
      }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-70"></div>

      {/* Glassmorphic Login Container */}
      <div className="relative z-10 max-w-md w-full bg-white bg-opacity-10 backdrop-blur-lg rounded-lg shadow-lg px-8 py-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          {/* <img src="/logo-white.png" className="w-24 mb-4" alt=" Logo" /> */}
          <h1 className="text-2xl sm:text-3xl font-bold text-white text-center">
            {/* Login to <span className="text-primaryColor">Workspace</span> */}
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          {/* Username / Email Input */}
          <Input
            label={"Username / Email"}
            placeholder="Enter your username or email"
            required
            value={userNameOrMail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (userNameOrMailError) setUserNameOrMailError("");
              setUserNameOrMail(e.target.value);
            }}
            errMsg={userNameOrMailError}
          />

          {/* Password Input */}
          <Password
            label={"Password"}
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (passwordError) setPasswordError("");
              setPassword(e.target.value);
            }}
            errMsg={passwordError}
          />

          {/* Login Button */}
          <Button
            label={loading ? "Loading" : "Login"}
            type="submit"
            disabled={loading}
            className="bg-primaryColor hover:bg-darkPrimaryColor text-white py-2 rounded-lg transition-all"
          />
        </form>

        {/* Footer */}
      </div>
    </div>
  );
};

export default Login;
