import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiOkResponse, ApiSimpleErrors } from '@/swagger';
import { AppService } from './app.service';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({
    summary: 'Health check',
    description: 'Verifica que la API está funcionando correctamente',
  })
  @ApiOkResponse('API está en línea', {
    status: 'up',
    timestamp: new Date().toISOString(),
    uptime: 3600,
    environment: 'production',
  })
  @ApiSimpleErrors()
  health() {
    return {
      message: 'API está en línea',
      data: this.appService.getHealth(),
    };
  }
}
