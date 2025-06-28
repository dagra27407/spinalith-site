import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

import Home from './pages/Home'

import { useEffect } from 'react';
import { supabase } from '../supabase/supabaseClient';

function App() {
  useEffect(() => {
    const fetchTables = async () => {
      const { data, error } = await supabase.rpc('list_tables');
      if (error) {
        console.error('Error calling list_tables:', error);
      } else {
        console.log('✅ Tables from Supabase:', data);
      }
    };

    fetchTables();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold text-center">
        Supabase Table List Test
      </h1>
      <p className="text-center text-gray-600">
        Open the browser console to see the table names.
      </p>
    </div>
  );
}

export default App;


