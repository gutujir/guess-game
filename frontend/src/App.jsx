import "./App.css";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuthThunk } from "./features/auth/authThunks";

import AppRoutes from "./routes/AppRoutes";

const App = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(checkAuthThunk());
  }, [dispatch]);
  return <AppRoutes />;
};

export default App;
