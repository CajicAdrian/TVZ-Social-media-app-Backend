import * as Joi from '@hapi/joi';

export const configValidationSchema = Joi.object({
  JWT_SECRET: Joi.string().required(),
});
