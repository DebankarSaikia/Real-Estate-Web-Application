import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Profile from './pages/Profile';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Listing from './pages/Listing';
import Search from './pages/Search';
import socket from './socket';
import GlobalChatNotifier from './components/GlobalChatNotifier';
import ChatBox from './components/ChatBox';

export default function App() {
  const currentUser = useSelector(state => state.user.currentUser);
  const [chatBoxData, setChatBoxData] = useState(null);
  useEffect(() => {
    if (currentUser?._id) {
      socket.emit('joinRoom', currentUser._id);
    }
  }, [currentUser?._id]);

  // Handler to open chat box from notification
  const handleOpenChat = (msg) => {
    setChatBoxData({
      chatId: msg.roomId,
      landlord: { username: msg.sender },
      listingId: msg.listingId,
      ownerId: msg.ownerId,
    });
  };

  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<SignUp />} />
          <Route path='/about' element={<About />} />
          <Route path='/search' element={<Search />} />
          <Route path='/listing/:listingId' element={<Listing />} />

          <Route element={<PrivateRoute />}>
            <Route path='/profile' element={<Profile />} />
            <Route path='/create-listing' element={<CreateListing />} />
            <Route
              path='/update-listing/:listingId'
              element={<UpdateListing />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
      <GlobalChatNotifier onOpenChat={handleOpenChat} />
      {chatBoxData && (
        <ChatBox
          chatId={chatBoxData.chatId}
          currentUser={currentUser}
          landlord={chatBoxData.landlord}
          listingId={chatBoxData.listingId}
          ownerId={chatBoxData.ownerId}
          onClose={() => setChatBoxData(null)}
        />
      )}
    </>
  );
}
