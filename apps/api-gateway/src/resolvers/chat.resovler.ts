import { ChatDto } from '@app/shared/dtos/chats/chat.dto';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { CacheInterceptor } from '../interceptors/cache.interceptor';
import { AppService } from '../app.service';
import { AuthGuard } from '../guards/auth.guard';

@Resolver(() => ChatDto)
@UseInterceptors(CacheInterceptor)
export class ChatResolver {
  constructor(private readonly appService: AppService) {}

  @Query(() => ChatDto, { name: 'chat' })
  @UseGuards(AuthGuard)
  async findChat(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<ChatDto> {
    return null;
  }
}
