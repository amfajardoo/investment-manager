import { EventManagerPlugin } from '@angular/platform-browser';

export class PreventModifierPlugin extends EventManagerPlugin {
  override supports(eventName: string): boolean {
    return eventName.includes('.prevent');
  }

  addEventListener(element: HTMLElement, eventName: string, handler: (event: Event) => void) {
    const realEventName = eventName.replace('.prevent', '');

    const callback = (event: Event) => {
      event.preventDefault();
      handler(event);
    };

    return this.manager.addEventListener(element, realEventName, callback);
  }
}
