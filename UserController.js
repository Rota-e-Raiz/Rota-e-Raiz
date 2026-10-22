export class UserController {
  static async index(req, res) {
    const mockUsers = [
      { id: 1, nome: "Ana Julia", email: "ana@email.com" },
      { id: 2, nome: "Clara Vitoria", email: "Vitoria@email.com" }
    ];
    return res.status(200).json(mockUsers);
  }

  static async create(req, res) {
    const { nome, email } = req.body;

    const newMockUser = {
      id: Math.floor(Math.random() * 1000),
      nome,
      email,
      createdAt: new Date().toISOString()
    };

    return res.status(201).json(newMockUser);
  }
}