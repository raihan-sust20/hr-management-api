import { AppError } from "../../../common/middlewares/error.middleware";
import { AuthRepository } from "../auth.repository";
import { AuthService } from "../auth.service";
import { IRegisterDto, type ILoginDto } from "../auth.type";

// Mock the repository
const mockAuthRepository = {
  emailExists: jest.fn(),
  createUser: jest.fn(),
  findByEmail: jest.fn(),
  verifyPassword: jest.fn(),
  findById: jest.fn(),
} as unknown as jest.Mocked<AuthRepository>;

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService(mockAuthRepository);
    jest.clearAllMocks();
  });

  
  describe('login', () => {
    const loginDto: ILoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUser = {
      id: 1,
      email: loginDto.email,
      password_hash: 'hashed_password',
      name: 'Test User',
      created_at: new Date(),
      updated_at: new Date(),
    };

    it('should login user successfully with valid credentials', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      mockAuthRepository.verifyPassword.mockResolvedValue(true);

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe(loginDto.email);
      expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockAuthRepository.verifyPassword).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password_hash
      );
    });

    it('should throw error if user not found', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(undefined);

      await expect(authService.login(loginDto)).rejects.toThrow(AppError);
      await expect(authService.login(loginDto)).rejects.toThrow('Invalid credentials');
      expect(mockAuthRepository.verifyPassword).not.toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
      mockAuthRepository.findByEmail.mockResolvedValue(mockUser);
      mockAuthRepository.verifyPassword.mockResolvedValue(false);

      await expect(authService.login(loginDto)).rejects.toThrow(AppError);
      await expect(authService.login(loginDto)).rejects.toThrow('Invalid credentials');
    });
  });
});
