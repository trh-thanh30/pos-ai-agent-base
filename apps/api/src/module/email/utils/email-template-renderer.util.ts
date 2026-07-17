import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class EmailTemplateRendererUtil {
  render(templateName: string, context: Record<string, unknown>) {
    const templatePath = this.resolveTemplatePath(templateName);
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    return Handlebars.compile(templateSource)({
      appName: process.env.APP_NAME || 'POS System',
      currentYear: new Date().getFullYear(),
      ...context,
    });
  }

  private resolveTemplatePath(templateName: string) {
    const fileName = `${templateName}.hbs`;
    const candidates = [
      path.join(process.cwd(), 'src', 'module', 'email', 'templates', fileName),
      path.join(
        process.cwd(),
        'dist',
        'module',
        'email',
        'templates',
        fileName,
      ),
      path.join(__dirname, '..', 'templates', fileName),
      path.join(
        __dirname,
        '..',
        '..',
        'module',
        'email',
        'templates',
        fileName,
      ),
    ];

    const templatePath = candidates.find((candidate) =>
      fs.existsSync(candidate),
    );

    if (!templatePath) {
      throw new Error(`Email template not found: ${fileName}`);
    }

    return templatePath;
  }
}
