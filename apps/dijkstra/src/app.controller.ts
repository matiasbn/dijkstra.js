import { Controller, Get } from '@nestjs/common';

@Controller('')
export class AppController {
  @Get('')
  health(): object {
    const info = {
      'node-version': process.version,
      memory: process.memoryUsage(),
      pid: process.pid,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      appName: process.env.name,
      appVersion: process.env.npm_package_version,
      hostname: process.env.HOSTNAME,
    };
    return info;
  }
}
