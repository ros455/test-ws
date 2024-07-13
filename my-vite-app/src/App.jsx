// import { useState, useEffect } from 'react';
// import './App.css';

// function App() {
//   const [count, setCount] = useState([]);
//   const [error, setError] = useState(null);
//   const [isConnected, setIsConnected] = useState(false);
//   const [retryTimeout, setRetryTimeout] = useState(null);

//   useEffect(() => {
//     const connectWebSocket = () => {
//       const ws = new WebSocket('ws://localhost:8080');

//       ws.onopen = () => {
//         console.log('Connected to server');
//         setIsConnected(true);
//         // Надсилаємо запит для отримання даних
//         ws.send('getNodes');
//       };

//       ws.onmessage = event => {
//         try {
//           const data = JSON.parse(event.data);
//           setCount(data);
//           console.log('Received data:', data);
//         } catch (error) {
//           console.error('Error parsing data:', error);
//           setError('Error parsing data: ' + error.message);
//         }
//       };

//       ws.onerror = (err) => {
//         console.error('WebSocket error:', err);
//         setError('WebSocket error: ' + JSON.stringify(err));
//         setIsConnected(false);
//       };

//       ws.onclose = () => {
//         console.log('Disconnected from server');
//         setIsConnected(false);
//         // Спроба повторного підключення через 3 секунди
//         if (!retryTimeout) {
//           setRetryTimeout(setTimeout(() => {
//             connectWebSocket();
//           }, 3000));
//         }
//       };
//     };

//     connectWebSocket();

//     return () => {
//       if (retryTimeout) {
//         clearTimeout(retryTimeout);
//       }
//     };
//   }, []);

//   return (
//     <>
//       <div>
//         {error && <p>{error}</p>}
//         {count?.map((item) => (
//           <p key={item._id}>{item.name}</p>
//         ))}
//       </div>
//     </>
//   )
// }

// export default App;

import { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryTimeout, setRetryTimeout] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const wsRef = useRef(null);

  const body = {
    "searchParams": {
      "page": 1,
      "limit": 10,
      "search": searchQuery
    },
    "type": "affiliate"
  };

  useEffect(() => {
    const connectWebSocket = () => {
      wsRef.current = new WebSocket('ws://localhost:8080');

      wsRef.current.onopen = () => {
        console.log('Connected to server');
        setIsConnected(true);
        // Надсилаємо початковий запит для отримання даних
        wsRef.current.send(JSON.stringify(body));
      };

      wsRef.current.onmessage = (event) => {
        try {
          const receivedData = JSON.parse(event.data);
          setData(receivedData);
          console.log('Received data:', receivedData);
        } catch (error) {
          console.error('Error parsing data:', error);
          setError('Error parsing data: ' + error.message);
        }
      };

      wsRef.current.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('WebSocket error: ' + JSON.stringify(err));
        setIsConnected(false);
      };

      wsRef.current.onclose = () => {
        console.log('Disconnected from server');
        setIsConnected(false);
        // Спроба повторного підключення через 3 секунди
        if (!retryTimeout) {
          setRetryTimeout(setTimeout(() => {
            connectWebSocket();
          }, 3000));
        }
      };
    };

    connectWebSocket();

    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []); // Виконати тільки при монтуванні компонента

  useEffect(() => {
    if (isConnected) {
      // Надсилаємо запит при зміні пошукового запиту
      wsRef.current.send(JSON.stringify(body));
    }
  }, [searchQuery, isConnected]); // Повторне відправлення запиту при зміні пошукового запиту або відновленні з'єднання

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  console.log('data',data);

  return (
    <>
      <div>
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Search by name"
        />
        {error && <p>{error}</p>}
        {data.list?.map((item) => (
          <p key={item._id}>{item.orderNumber}</p>
        ))}
      </div>
    </>
  );
}

export default App;