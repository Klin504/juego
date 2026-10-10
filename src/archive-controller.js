/**
 * archive-controller.js
 * Controlador del Archivo del recorrido y Terminal de mantenimiento.
 * Fase 3.1 según contrato 1.5 y EASTER_EGG.md.
 */

import {
  ARCHIVE_SHEETS,
  TERMINAL_MESSAGES,
  VALID_MAINTENANCE_WORD,
  normalizarPalabra,
} from "./archive-data.js";
import { readVisorUnlocked, saveVisorUnlocked } from "./campaign-storage.js";

export class ArchiveController {
  #storage;
  #sheetIndex = 0;
  #terminalOpen = false;
  #inputText = "";
  #message = "";
  #unlocked = false;
  #storageFailed = false;

  constructor(storage = globalThis.localStorage) {
    this.#storage = storage;
    this.#unlocked = readVisorUnlocked(storage);
  }

  get sheetIndex() {
    return this.#sheetIndex;
  }

  get currentSheet() {
    return ARCHIVE_SHEETS[this.#sheetIndex];
  }

  get sheets() {
    return ARCHIVE_SHEETS;
  }

  get terminalOpen() {
    return this.#terminalOpen;
  }

  get inputText() {
    return this.#inputText;
  }

  get message() {
    return this.#message;
  }

  get unlocked() {
    return this.#unlocked;
  }

  get storageFailed() {
    return this.#storageFailed;
  }

  selectNextSheet() {
    this.#sheetIndex = (this.#sheetIndex + 1) % ARCHIVE_SHEETS.length;
    return this.#sheetIndex;
  }

  selectPreviousSheet() {
    this.#sheetIndex =
      (this.#sheetIndex + ARCHIVE_SHEETS.length - 1) % ARCHIVE_SHEETS.length;
    return this.#sheetIndex;
  }

  selectSheet(index) {
    if (index >= 0 && index < ARCHIVE_SHEETS.length) {
      this.#sheetIndex = index;
    }
    return this.#sheetIndex;
  }

  openTerminal() {
    this.#terminalOpen = true;
    if (this.#unlocked) {
      this.#message = TERMINAL_MESSAGES.ALREADY_UNLOCKED;
    } else {
      this.#message = "";
    }
  }

  closeTerminal() {
    this.#terminalOpen = false;
  }

  setInputText(text) {
    this.#inputText = String(text ?? "");
  }

  appendChar(char) {
    if (this.#inputText.length < 32 && char && char.length === 1) {
      this.#inputText += char;
    }
  }

  backspace() {
    if (this.#inputText.length > 0) {
      this.#inputText = this.#inputText.slice(0, -1);
    }
  }

  clearInput() {
    this.#inputText = "";
  }

  submitWord() {
    const raw = this.#inputText;
    const normalized = normalizarPalabra(raw);

    if (!normalized) {
      this.#message = TERMINAL_MESSAGES.EMPTY;
      return Object.freeze({
        success: false,
        reason: "empty",
        message: this.#message,
      });
    }

    if (normalized !== VALID_MAINTENANCE_WORD) {
      this.#message = TERMINAL_MESSAGES.INCORRECT;
      return Object.freeze({
        success: false,
        reason: "incorrect",
        message: this.#message,
      });
    }

    // Palabra correcta:
    if (this.#unlocked) {
      this.#message = TERMINAL_MESSAGES.ALREADY_UNLOCKED;
      return Object.freeze({
        success: true,
        newlyUnlocked: false,
        message: this.#message,
      });
    }

    // Primer desbloqueo
    this.#unlocked = true;
    const saved = saveVisorUnlocked(true, this.#storage);
    if (saved === null) {
      this.#storageFailed = true;
      this.#message = TERMINAL_MESSAGES.STORAGE_FAILED;
    } else {
      this.#message = TERMINAL_MESSAGES.FIRST_UNLOCK;
    }

    return Object.freeze({
      success: true,
      newlyUnlocked: true,
      storageFailed: this.#storageFailed,
      message: this.#message,
    });
  }
}
