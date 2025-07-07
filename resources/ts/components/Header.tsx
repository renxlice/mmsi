import React from 'react';

type Props = {
  name: string;
};

const Header: React.FC<Props> = ({ name }) => {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-lg font-semibold">Welcome, {name}</h1>
      <button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">
        Logout
      </button>
    </header>
  );
};

export default Header;
