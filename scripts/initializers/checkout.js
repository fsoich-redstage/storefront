import { getHeaders } from '@dropins/tools/lib/aem/configs.js';
import { initializers } from '@dropins/tools/initializer.js';
import { initialize, setFetchGraphQlHeaders, fetchAvailableShippingMethods, fetchCart } from '@dropins/storefront-checkout/api.js';
import { initializeDropin } from './index.js';
import { fetchPlaceholders } from '../commerce.js';
import { events } from '@dropins/tools/lib/events.js';

// Prefijo global para logs
const ggg = (...args) => console.log('🛠️ ggg CHECKOUT:', ...args);

await initializeDropin(async () => {
  ggg('🚀 Iniciando Drop-in Checkout');

  // Paso 2: Setear headers para GraphQL
  setFetchGraphQlHeaders((prev) => {
    const headers = { ...prev, ...getHeaders('checkout') };
    ggg('📡 Seteando headers GraphQL:', headers);
    return headers;
  });

  // Paso 3: Cargar placeholders del archivo
  const labels = await fetchPlaceholders('placeholders/checkout.json');
  const langDefinitions = {
    default: {
      ...labels,
    },
  };
  ggg('🗂️ Placeholders cargados:', langDefinitions);

  // Paso 4: Inicializar checkout con transformación de CartModel
  ggg('⚙️ Ejecutando mountImmediately');
  return initializers.mountImmediately(initialize, {
    langDefinitions,
    models: {
      CartModel: {
        transformer: (data) => {
          ggg('🧱 Transformando modelo CartModel:', data);
          return {
            availablePaymentMethods: data?.available_payment_methods,
            selectedPaymentMethod: data?.selected_payment_method,
          };
        },
      },
    },
  });
});

// Evento: checkout iniciado
events.on('checkout/initialized', async () => {
  ggg('🏁 Evento: checkout/initialized');

  const cart = await fetchCart();
  ggg('🛒 Carrito actual:', cart);

  const shippingMethods = await fetchAvailableShippingMethods();
  ggg('🚚 Métodos de envío disponibles:', shippingMethods);
});

// Evento: cambio en los valores del formulario
events.on('checkout/values', async (values) => {
  ggg('📝 Evento: checkout/values', values);

  if (values?.selectedShippingAddress?.postcode) {
    ggg('📍 Código postal:', values.selectedShippingAddress.postcode);
    const updatedShipping = await fetchAvailableShippingMethods();
    ggg('🔄 Métodos de envío luego del cambio de dirección:', updatedShipping);
  }
});
