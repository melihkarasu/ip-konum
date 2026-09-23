let geoMap = null;
        let geoMarker = null;

        function initGeoMap() {
          geoMap = L.map('geo-map', {
            center: [39, 35],
            zoom: 5
          });

          L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
            maxZoom: 19
          }).addTo(geoMap);
        }

        async function fetchIpInfo(queryIp = '') {
          const errBox = document.getElementById('ip-error-box');
          errBox.classList.add('hidden');

          try {
            const url = queryIp ? `/api/ip/lookup?ip=${encodeURIComponent(queryIp)}` : '/api/ip/lookup';
            const res = await fetch(url);
            const data = await res.json();

            if (!data.success) {
              throw new Error(data.error || 'Konum bilgisi alınamadı');
            }

            document.getElementById('res-ip').innerText = data.ip;
            document.getElementById('res-country').innerText = `${data.country} (${data.countryCode})`;
            document.getElementById('res-city').innerText = `${data.city}, ${data.regionName}`;
            document.getElementById('res-isp').innerText = data.isp;
            document.getElementById('res-as').innerText = data.as || '-';
            document.getElementById('res-tz').innerText = data.timezone;
            document.getElementById('res-zip').innerText = data.zip || '-';

            // Haritada Göster
            if (geoMap && data.lat && data.lon) {
              const pos = [data.lat, data.lon];
              geoMap.setView(pos, 11, { animate: true });

              if (geoMarker) geoMarker.remove();

              const customIcon = L.divIcon({
                html: '<div style="font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); transform: translate(-14px, -14px);">📍</div>',
                className: 'custom-geo-icon',
                iconSize: [28, 28]
              });

              geoMarker = L.marker(pos, { icon: customIcon })
                .addTo(geoMap)
                .bindPopup(`<strong>${data.city}, ${data.country}</strong><br>${data.ip}<br>${data.isp}`)
                .openPopup();
            }
          } catch(err) {
            errBox.innerText = '⚠️ ' + err.message;
            errBox.classList.remove('hidden');
          }
        }

        function lookupIp() {
          const val = document.getElementById('input-ip').value.trim();
          fetchIpInfo(val);
        }

        function lookupSelfIp() {
          document.getElementById('input-ip').value = '';
          fetchIpInfo('');
        }

        document.addEventListener('DOMContentLoaded', () => {
          initGeoMap();
          fetchIpInfo('');
        });
