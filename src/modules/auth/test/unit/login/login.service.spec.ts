import { UserNotFoundError } from './../../../../user/src/domain/errors/user-not-found.domain.error';
import { MockType } from './../../../../../../test/utilities/mock-factory';
import { LoginService } from './../../../src/application/login/login.service';
import { UserEntity } from './../../../../user/src/domain/entities/user.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Repository } from 'typeorm';

/* eslint-disable @typescript-eslint/no-unused-vars */
describe('CreateUserService', () => {
  let service: LoginService;
  let userRepositoryMock: MockType<Repository<UserEntity>>;

  beforeEach(async () => {
    const mockUserService = {
      findOne: jest
        .fn()
        .mockImplementation((dto) => Promise.resolve(UserEntity)),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secretOrPrivateKey: process.env.SECRETKEY || 'secretKey',
          signOptions: {
            expiresIn: 3600,
          },
        }),
      ],
      providers: [
        LoginService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
    userRepositoryMock = module.get(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a http exception if the user if not found', async () => {
    userRepositoryMock.findOne.mockReturnValue(undefined);
    expect(
      service.execute({ email: 'as', password: 'password' }),
    ).rejects.toThrowError(new UserNotFoundError());
  });
});