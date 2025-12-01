import path from 'path';

export default ({ env }) => {
  const client = env('DATABASE_CLIENT', 'postgres');
  const databaseUrl = env('DATABASE_URL');
  const useSsl = env.bool('DATABASE_SSL', false);

  // Funzione per parsare DATABASE_URL quando serve SSL
  const parseDatabaseUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      return {
        host: parsed.hostname,
        port: parseInt(parsed.port) || 5432,
        database: parsed.pathname.slice(1), // Rimuove il leading /
        user: parsed.username,
        password: parsed.password,
      };
    } catch (error) {
      return null;
    }
  };

  // Per PostgreSQL, quando usiamo connectionString con SSL, dobbiamo parsare l'URL
  let postgresConnection;
  
  if (databaseUrl && useSsl) {
    // Parse DATABASE_URL per estrarre i parametri quando serve SSL
    const parsed = parseDatabaseUrl(databaseUrl);
    if (parsed) {
      postgresConnection = {
        host: parsed.host,
        port: parsed.port,
        database: parsed.database,
        user: parsed.user,
        password: parsed.password,
        ssl: {
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      };
    } else {
      // Fallback se il parsing fallisce
      postgresConnection = {
        connectionString: databaseUrl,
        ssl: {
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
        },
        schema: env('DATABASE_SCHEMA', 'public'),
      };
    }
  } else if (databaseUrl) {
    // Usa connectionString quando SSL non è richiesto
    postgresConnection = {
      connectionString: databaseUrl,
      schema: env('DATABASE_SCHEMA', 'public'),
    };
  } else {
    // Fallback ai parametri separati
    postgresConnection = {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'strapi'),
      user: env('DATABASE_USERNAME', 'strapi'),
      password: env('DATABASE_PASSWORD', 'strapi'),
      ssl: useSsl ? {
        rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', false),
      } : false,
      schema: env('DATABASE_SCHEMA', 'public'),
    };
  }

  const connections = {
    mysql: {
      connection: {
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 3306),
        database: env('DATABASE_NAME', 'strapi'),
        user: env('DATABASE_USERNAME', 'strapi'),
        password: env('DATABASE_PASSWORD', 'strapi'),
        ssl: env.bool('DATABASE_SSL', false) && {
          key: env('DATABASE_SSL_KEY', undefined),
          cert: env('DATABASE_SSL_CERT', undefined),
          ca: env('DATABASE_SSL_CA', undefined),
          capath: env('DATABASE_SSL_CAPATH', undefined),
          cipher: env('DATABASE_SSL_CIPHER', undefined),
          rejectUnauthorized: env.bool('DATABASE_SSL_REJECT_UNAUTHORIZED', true),
        },
      },
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    postgres: {
      connection: postgresConnection,
      pool: { min: env.int('DATABASE_POOL_MIN', 2), max: env.int('DATABASE_POOL_MAX', 10) },
    },
    sqlite: {
      connection: {
        filename: path.join(__dirname, '..', '..', env('DATABASE_FILENAME', '.tmp/data.db')),
      },
      useNullAsDefault: true,
    },
  };

  return {
    connection: {
      client,
      ...connections[client],
      acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
    },
  };
};
