import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { getCurrentUser } from "./context/slices/authSlice";

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {

    dispatch(getCurrentUser());
  }, [dispatch]);

  return <RouterProvider router={router} />;
};

export default App;