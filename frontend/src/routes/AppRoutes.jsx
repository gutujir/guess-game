import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "../components/Navbar";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import SessionList from "../pages/game/SessionList";
import CreateSessionForm from "../pages/game/CreateSessionForm";
import JoinSessionForm from "../pages/game/JoinSessionForm";
import GameSession from "../pages/game/GameSession";

const AppRoutes = () => {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/lobby" element={<SessionList />} />
        <Route path="/game/create" element={<CreateSessionForm />} />
        <Route path="/game/join" element={<JoinSessionForm />} />
        <Route path="/game/:code" element={<GameSession />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
