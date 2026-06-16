import { loadEnv, Modules, defineConfig } from '@medusajs/framework/utils';

loadEnv(process.env.NODE_ENV, process.cwd());

function assertValue(value, message) {
  if (value === undefined) {
    throw new Error(message);
  }

  return value;
}

const ADMIN_CORS = process.env.ADMIN_CORS;
const AUTH_CORS = process.env.AUTH_CORS;
const BACKEND_URL = process.env.BACKEND_PUBLIC_URL ?? process.env.RAILWAY_PUBLIC_DOMAIN_VALUE ?? 'http://localhost:9000';
const COOKIE_SECRET = assertValue(process.env.COOKIE_SECRET, 'Environment variable for COOKIE_SECRET is not set');
const DATABASE_URL = assertValue(process.env.DATABASE_URL, 'Environment variable for DATABASE_URL is not set');
const JWT_SECRET = assertValue(process.env.JWT_SECRET, 'Environment variable for JWT_SECRET is not set');
const REDIS_URL = process.env.REDIS_URL;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || process.env.RESEND_FROM;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || process.env.SENDGRID_FROM;
const SHOULD_DISABLE_ADMIN = process.env.MEDUSA_DISABLE_ADMIN === 'true';
const STORE_CORS = process.env.STORE_CORS;
const STRIPE_API_KEY = process.env.STRIPE_API_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const WORKER_MODE = process.env.MEDUSA_WORKER_MODE ?? 'shared';
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT;
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY;
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY;
const MINIO_BUCKET = process.env.MINIO_BUCKET;
const SHIPPO_API_TOKEN = process.env.SHIPPO_API_TOKEN;
const SHIPPO_API_URL = process.env.SHIPPO_API_URL;

const medusaConfig = {
  projectConfig: {
    databaseUrl: DATABASE_URL,
    databaseLogging: false,
    redisUrl: REDIS_URL,
    workerMode: WORKER_MODE,
    http: {
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      storeCors: STORE_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET
    },
    build: {
      rollupOptions: {
        external: ["@medusajs/dashboard", "@medusajs/admin-shared"]
      }
    }
  },
  admin: {
    backendUrl: BACKEND_URL,
    disable: SHOULD_DISABLE_ADMIN,
  },
  modules: [
    {
      key: Modules.FILE,
      resolve: '@medusajs/file',
      options: {
        providers: [
          ...(MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY ? [{
            resolve: './src/modules/minio-file',
            id: 'minio',
            options: {
              endPoint: MINIO_ENDPOINT,
              accessKey: MINIO_ACCESS_KEY,
              secretKey: MINIO_SECRET_KEY,
              bucket: MINIO_BUCKET // Optional, default: medusa-media
            }
          }] : [{
            resolve: '@medusajs/file-local',
            id: 'local',
            options: {
              upload_dir: 'static',
              backend_url: `${BACKEND_URL}/static`
            }
          }])
        ]
      }
    },
    ...(REDIS_URL ? [{
      key: Modules.EVENT_BUS,
      resolve: '@medusajs/event-bus-redis',
      options: {
        redisUrl: REDIS_URL
      }
    },
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: '@medusajs/workflow-engine-redis',
      options: {
        redis: {
          url: REDIS_URL,
        }
      }
    }] : []),
    ...(SENDGRID_API_KEY && SENDGRID_FROM_EMAIL || RESEND_API_KEY && RESEND_FROM_EMAIL ? [{
      key: Modules.NOTIFICATION,
      resolve: '@medusajs/notification',
      options: {
        providers: [
          ...(SENDGRID_API_KEY && SENDGRID_FROM_EMAIL ? [{
            resolve: '@medusajs/notification-sendgrid',
            id: 'sendgrid',
            options: {
              channels: ['email'],
              api_key: SENDGRID_API_KEY,
              from: SENDGRID_FROM_EMAIL,
            }
          }] : []),
          ...(RESEND_API_KEY && RESEND_FROM_EMAIL ? [{
            resolve: './src/modules/email-notifications',
            id: 'resend',
            options: {
              channels: ['email'],
              api_key: RESEND_API_KEY,
              from: RESEND_FROM_EMAIL,
            },
          }] : []),
        ]
      }
    }] : []),
    ...(STRIPE_API_KEY && STRIPE_WEBHOOK_SECRET ? [{
      key: Modules.PAYMENT,
      resolve: '@medusajs/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: STRIPE_API_KEY,
              webhookSecret: STRIPE_WEBHOOK_SECRET,
              // Capture immediately on confirm. The default (manual) is
              // for pre-auth holds and breaks Stripe Elements wallet
              // confirmation: "capture_method (manual) does not match the
              // expected capture_method (automatic)".
              capture: true,
            },
          },
        ],
      },
    }] : []),
    ...(SHIPPO_API_TOKEN ? [{
      key: Modules.FULFILLMENT,
      resolve: '@medusajs/medusa/fulfillment',
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/fulfillment-manual',
            id: 'manual',
          },
          {
            resolve: './src/modules/shippo',
            id: 'shippo',
            options: {
              api_token: SHIPPO_API_TOKEN,
              api_url: SHIPPO_API_URL,
              from_email: 'hello@thedabpal.com',
              // Uses item variant weights to compute parcel weight per order.
              // Dab Pal poly mailer dimensions; weight is computed dynamically.
              // Fallback parcel dimensions (1-pack poly mailer).
              // Per-variant dims (length/width/height) are read from Medusa
              // variants and override this when present.
              default_parcel: {
                length: '4',
                width: '6',
                height: '1',
                distance_unit: 'in',
                mass_unit: 'oz',
              },
              packaging_weight_oz: 0,
              default_from: {
                name: 'Dab Pal',
                company: 'Dab Pal',
                street1: '361 Stagg St #201',
                city: 'Brooklyn',
                state: 'NY',
                zip: '11206',
                country: 'US',
                phone: process.env.SHIPPO_FROM_PHONE || '9709034749',
              },
              // Fallback map for orders placed before shipping options used shippo_shippo.
              // Maps Medusa shipping_option_id -> Shippo service group.
              shipping_option_data_map: {
                'so_01KQX07HMV29YVB18YEF7EF0WT': {
                  service_group_id: '3a9ac843864f4b8a806c96c1be9f5d58',
                  service_group_name: 'Standard Shipping',
                },
                'so_01KQX07J0G31QZ6175JDESG7MW': {
                  service_group_id: '91cd6ba8d21b43039f394c97bec71c0b',
                  service_group_name: 'Priority Shipping',
                },
              },
            },
          },
        ],
      },
    }] : [])
  ]
};

export default defineConfig(medusaConfig);
