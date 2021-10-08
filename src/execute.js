import { pool, promisePool } from './pool';
import { parseParameters } from './parser';
import { slowQueryWarning, debug, resourceName } from './config';

const execute = (query, parameters, resource, callback) => {
  try {
    const time = debug ? process.hrtime.bigint() : Date.now();

    [query, parameters] = parseParameters(query, parameters);

    pool.query(query, parameters, (err, result) => {
      const executionTime = debug ? Number(process.hrtime.bigint() - time) / 1e6 : Date.now() - time;

      if (executionTime >= slowQueryWarning || debug)
        console.log(
          `^3[${debug ? 'DEBUG' : 'WARNING'}] ${resource} took ${executionTime}ms to execute a query!
          ${query} ${JSON.stringify(parameters)}^0`
        );

      callback(result);
    });
  } catch (error) {
    console.log(
      `^1[ERROR] ${resource} was unable to execute a query!
        ${error.message}
        ${error.sql || `${query} ${JSON.stringify(parameters)}`}^0`
    );
    debug && console.trace(error);
  }
};

const executeSync = async (query, parameters, resource) => {
  ScheduleResourceTick(resourceName);
  try {
    const time = debug ? process.hrtime.bigint() : Date.now();

    [query, parameters] = parseParameters(query, parameters);

    const [result] = await promisePool.query(query, parameters);

    const executionTime = debug ? Number(process.hrtime.bigint() - time) / 1e6 : Date.now() - time;

    if (executionTime >= slowQueryWarning || debug)
      console.log(
        `^3[${debug ? 'DEBUG' : 'WARNING'}] ${resource} took ${executionTime}ms to execute a query!
        ${query} ${JSON.stringify(parameters)}^0`
      );

    return result;
  } catch (error) {
    console.log(
      `^1[ERROR] ${resource} was unable to execute a query!
        ${error.message}
        ${error.sql || `${query} ${JSON.stringify(parameters)}`}^0`
    );
    debug && console.trace(error);
  }
};

export { execute, executeSync };
