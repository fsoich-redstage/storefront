import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';
import { events } from '@dropins/tools/event-bus.js';

console.log('[checkout.js] 🚀 Iniciando Drop-in de Checkout... ***');

const handleCheckoutInitialized = ({ data }) => {
  console.log('[checkout.js] ✅ Checkout inicializado:', data, '***');
};

const handleCartData = ({ data }) => {
  console.log('[checkout.js] 🛒 Cart data recibido:', data, '***');
  console.log('[checkout.js] 💳 Métodos de pago:', data?.available_payment_methods, '***');
  console.log('[checkout.js] 🚚 Métodos de envío:', data?.available_shipping_methods, '***');
};

await initializeDropin(async () => {
  console.log('[checkout.js] ⚙️ Dentro de initializeDropin ***');

  setFetchGraphQlHeaders((prev) => ({ ...prev, ...getHeaders('checkout') }));
  console.log('[checkout.js] ✅ Headers GraphQL seteados ***');

  const labels = await fetchPlaceholders('placeholders/checkout.json');
  const langDefinitions = {
    default: {
      ...labels,
    },
  };
  console.log('[checkout.js] 🏷️ Labels cargados:', labels, '***');

  // Paso 3: Inicialización del checkout
  events.on('checkout/initialized', handleCheckoutInitialized, { eager: true });

  // Paso 4: Datos del carrito (shipping y payment methods)
  events.on('cart/data', handleCartData, { eager: true });

  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          console.log('[checkout.js] 🔁 Transformando CartModel:', data, '***');
          return {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
            availableShippingMethods: data?.available_shipping_methods,
            selectedShippingMethod: data?.selected_shipping_method,
          };
        },
      },
    },
  });
})();
