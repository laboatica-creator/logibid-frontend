import { io } from 'socket.io-client';

class DriverLocationService {
  constructor() {
    this.socket = null;
    this.watchId = null;
    this.driverId = null;
    this.requestId = null;
  }

  connect() {
    if (!this.socket) {
      this.socket = io('https://logibid-api.onrender.com');
    }
  }

  startTracking(driverId, requestId = null) {
    this.connect();
    this.driverId = driverId;
    this.requestId = requestId;

    if ("geolocation" in navigator) {
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          if (this.socket) {
            this.socket.emit('driver-location-update', {
              driver_id: this.driverId,
              request_id: this.requestId,
              lat,
              lng,
              timestamp: new Date().toISOString()
            });
          }
        },
        (error) => console.error("Error watching position:", error),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    } else {
      console.error("Geolocalización no soportada por el navegador");
    }
  }

  stopTracking() {
    if (this.watchId !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new DriverLocationService();
