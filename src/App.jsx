import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Learn from "./pages/Learn";
import Revise from "./pages/Revise";
import Test from "./pages/Test";
import Flashcards from "./pages/Flashcards";
import Sentences from "./pages/Sentences";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/revise" element={<Revise />} />
        <Route path="/test" element={<Test />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/sentences" element={<Sentences />} />
      </Route>
    </Routes>
  );
}
