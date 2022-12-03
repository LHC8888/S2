import type { Event } from '@antv/g-canvas';
import { isEmpty } from 'lodash';
import type { DataCell } from '../cell';
import {
  CellTypes,
  InteractionStateName,
  InterceptType,
  S2Event,
} from '../common/constant';
import type { CellMeta, S2CellType, ViewMeta } from '../common/interface';
import {
  getCellMeta,
  isMultiSelectionKey,
  getInteractionCellsBySelectedCells,
} from '../utils/interaction/select-event';
import { getCellsTooltipData } from '../utils/tooltip';
import { selectedCellHighlightAdaptor } from '../utils/cell/data-cell';
import { BaseEvent, type BaseEventImplement } from './base-interaction';

export class DataCellMultiSelection
  extends BaseEvent
  implements BaseEventImplement
{
  private isMultiSelection = false;

  public bindEvents() {
    this.bindKeyboardDown();
    this.bindDataCellClick();
    this.bindKeyboardUp();
  }

  public reset() {
    this.isMultiSelection = false;
    this.spreadsheet.interaction.removeIntercepts([InterceptType.CLICK]);
  }

  private bindKeyboardDown() {
    this.spreadsheet.on(
      S2Event.GLOBAL_KEYBOARD_DOWN,
      (event: KeyboardEvent) => {
        if (isMultiSelectionKey(event)) {
          this.isMultiSelection = true;
          this.spreadsheet.interaction.addIntercepts([InterceptType.CLICK]);
        }
      },
    );
  }

  private bindKeyboardUp() {
    this.spreadsheet.on(S2Event.GLOBAL_KEYBOARD_UP, (event: KeyboardEvent) => {
      if (isMultiSelectionKey(event)) {
        this.reset();
      }
    });
  }

  private getSelectedCells(cell: S2CellType<ViewMeta>) {
    const id = cell.getMeta().id;
    const { interaction } = this.spreadsheet;
    let selectedCells = interaction.getCells([CellTypes.DATA_CELL]);
    let cells: CellMeta[] = [];
    if (interaction.getCurrentStateName() !== InteractionStateName.SELECTED) {
      selectedCells = [];
    }
    if (selectedCells.find((meta) => meta.id === id)) {
      cells = selectedCells.filter((item) => item.id !== id);
    } else {
      cells = [...selectedCells, getCellMeta(cell)];
    }

    return cells;
  }

  private bindDataCellClick() {
    this.spreadsheet.on(S2Event.DATA_CELL_CLICK, (event: Event) => {
      event.stopPropagation();
      const cell: DataCell = this.spreadsheet.getCell(event.target);
      const meta = cell.getMeta();
      const { interaction, options } = this.spreadsheet;

      if (this.isMultiSelection && meta) {
        const selectedCells = this.getSelectedCells(cell);

        if (isEmpty(selectedCells)) {
          interaction.clearState();
          this.spreadsheet.hideTooltip();
          return;
        }

        interaction.addIntercepts([InterceptType.CLICK, InterceptType.HOVER]);
        this.spreadsheet.hideTooltip();

        const { colHeader, rowHeader } = selectedCellHighlightAdaptor(
          options.interaction.selectedCellHighlight,
        );

        interaction.changeState({
          cells: getInteractionCellsBySelectedCells(
            selectedCells,
            this.spreadsheet,
          ),
          stateName: InteractionStateName.SELECTED,
          onUpdateCells: (root, updateDataCells) => {
            if (colHeader) {
              root.updateCells(root.getAllColHeaderCells());
            }
            if (rowHeader) {
              root.updateCells(root.getAllRowHeaderCells());
            }
            updateDataCells();
          },
        });
        this.spreadsheet.emit(
          S2Event.GLOBAL_SELECTED,
          interaction.getActiveCells(),
        );
        this.spreadsheet.showTooltipWithInfo(
          event,
          getCellsTooltipData(this.spreadsheet),
        );
      }
    });
  }
}
