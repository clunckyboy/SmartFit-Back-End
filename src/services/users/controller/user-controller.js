import InvariantError from "../../../exceptions/invariant-error.js";
import response from "../../../utils/response.js";
import UserRepositories from "../repositories/user-repositories.js";

export const createUser = async (req, res, next) => {
  const { username, email, password, first_name, last_name, sex, weight, height, goal } = req.body;

  const user = await UserRepositories.createUser(
    username, email, password, first_name, last_name, sex, weight, height, goal
  );

  if (!user) return next(new InvariantError('Failed to create user'));

  return response(res, 201, 'User created successfully', user);
};

export const getUserById = async (req, res, next) => {
  const { id } = req.user;

  const user = await UserRepositories.createUser(id);

  if (!user) return next(new InvariantError('Failed to retrieve user'));

  return response(res, 201, 'User retrieved successfully', user);
};