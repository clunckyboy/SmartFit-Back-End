import { Pool } from "pg";
import { nanoid } from "nanoid";

class UserRepositories {
  constructor() {
    this.pool = new Pool();
  }

  async createUser(username, email, password, first_name, last_name, gender, weight, height, goal) {
    const id = nanoid(16);
    const bmi = weight / ((height / 100) ** 2);
    const bmi_category = 
      bmi < 18.5 ? 'Underweight' :
      bmi < 25 ? 'Normal' :
      bmi < 30 ? 'Overweight' : 'Obese';

    const query = {
      text: 'INSERT INTO users VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id',
      values: [id, username, email, password, first_name, last_name, gender, weight, height, goal, bmi, bmi_category]
    };

    const result = await this.pool.query(query);
    return result.rows[0];
  }

  async getUserById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };
    const user = await this.pool.query(query);
    return user.rows[0];
  }
}

export default new UserRepositories();