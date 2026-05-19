import { IOutput } from './IOutput';

export class ConsoleOutput implements IOutput {
  write(message: string): void {
    console.log(message);
  }
}
