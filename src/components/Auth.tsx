
import React, { useState } from 'react';
import Login from './Login';
import SignUp from './SignUp';

const Auth = () => {
  const [showLogin, setShowLogin] = useState(true);

  const toggleView = () => {
    setShowLogin(!showLogin);
  };

  return (
    <>
      {showLogin ? <Login toggleView={toggleView} /> : <SignUp toggleView={toggleView} />}
      <div className="text-center mt-3">
        <Link href="/enquiry" className="btn btn-link">Student Enquiry</Link>
        <Link href="/find-centre" className="btn btn-link">Find a Centre</Link>
      </div>
    </>
  );
};

export default Auth;
