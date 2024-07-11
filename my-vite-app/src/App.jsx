import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState([]);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [retryTimeout, setRetryTimeout] = useState(null);

  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8080');

      ws.onopen = () => {
        console.log('Connected to server');
        setIsConnected(true);
        // Надсилаємо запит для отримання даних
        ws.send('getNodes');
      };

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          setCount(data);
          console.log('Received data:', data);
        } catch (error) {
          console.error('Error parsing data:', error);
          setError('Error parsing data: ' + error.message);
        }
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        setError('WebSocket error: ' + JSON.stringify(err));
        setIsConnected(false);
      };

      ws.onclose = () => {
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
    };
  }, []);

  return (
    <>
      <div>
        {error && <p>{error}</p>}
        {count?.map((item) => (
          <p key={item._id}>{item.name}</p>
        ))}
      </div>
    </>
  )
}

export default App;