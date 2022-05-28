import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import AppLayout from "./AppLayout/AppLayout";
import RequireAuth from "../auth/RequireAuth";

import HomeScreen from "./screens/AlternativeHome/AltHome";
// import HomeScreen from "./screens/home/Home";
import LogInScreen from "./screens/login/LoginScreen";
import Register from "./screens/register/RegisterScreen";
import { CreateRestaurant } from "./screens/createRestaurant/CreateRestaurant";

import CreateGroupContainer from "./screens/createGroup/CreateGroupContainer";
import GroupView from "./screens/groupView/GroupView";
import "./App.css";

const App: React.FC = (props): JSX.Element => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route path="" element={<HomeScreen />} />
          <Route path="login-screen" element={<LogInScreen />} />
          <Route path="register-screen" element={<Register />} />
          <Route
            path="create-group-screen"
            element={
              <RequireAuth>
                <CreateGroupContainer />
              </RequireAuth>
            }
          />
          <Route
            path="group-page/:id"
            element={
              <RequireAuth>
                <GroupView />
              </RequireAuth>
            }
          />
          <Route path="create-restaurant" element={<CreateRestaurant />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
