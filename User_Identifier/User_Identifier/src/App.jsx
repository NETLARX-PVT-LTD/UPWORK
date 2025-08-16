import Email from './Pages/Email';
import UploadImage from './Pages/UploadImage';
import PageNotFound from './Pages/pageNotFound';
import Home from './Pages/Home';
import VerifyPage from './Pages/verifyPage';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FaceDetectComponent from './Pages/FaceDetect';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/email" element={<Email />} />
        <Route path='/detect' element={<FaceDetectComponent/>} />
        <Route path="/upload" element={<UploadImage />} />
        <Route path="/verify/:code" element={<VerifyPage />} />
        <Route path="/404" element={<PageNotFound />} />
      </Routes>
    </Router>
  );
};

export default App;