import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import Dashboard from "../pages/Dashboard";
import ExamBoardPage from "../pages/ExamBoardPage";
import ExamDetails from "../pages/ExamDetails";
import Profile from "../pages/Profile";

import ProtectedRoute from "../components/ProtectedRoute";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/exams/board/:board" element={<ExamBoardPage />} />
        <Route path="/exams/:id" element={<ExamDetails />} />
        <Route path="/profile" element={<Profile />} />
      </Route>


    </Routes>
  );
};

export default AppRoutes;