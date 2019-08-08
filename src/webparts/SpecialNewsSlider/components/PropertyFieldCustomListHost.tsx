/**
 * @file PropertyFieldCustomListHost.tsx
 * Renders the controls for PropertyFieldCustomList component
 *
 * @copyright 2016 Olivier Carpentier
 * Released under MIT licence
 */
import * as React from 'react';
import styles from './PropertyFields.module.scss';
import { IPropertyFieldCustomListPropsInternal, ICustomListField, CustomListFieldType } from './PropertyFieldCustomList';
import PropertyFieldPicturePickerHost from './PropertyFieldPicturePickerHost';
import { Label } from 'office-ui-fabric-react/lib/Label';
import { DefaultButton, PrimaryButton, IButtonProps } from 'office-ui-fabric-react/lib/Button';
import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import { CommandBar } from 'office-ui-fabric-react/lib/CommandBar';
import { MessageBar } from 'office-ui-fabric-react/lib/MessageBar';
import {
  CheckboxVisibility,
  ConstrainMode,
  DetailsList,
  DetailsListLayoutMode as LayoutMode,
  SelectionMode,
  Selection,
  buildColumns
} from 'office-ui-fabric-react/lib/DetailsList';
import PropertyFieldDatePickerHost from './PropertyFieldDatePickerHost';
import PropertyFieldDateTimePickerHost from './PropertyFieldDateTimePickerHost';
import GuidHelper from './GuidHelper';

import * as strings from 'sp-client-custom-fields/strings';
/**
 * @interface
 * PropertyFieldCustomListHost properties interface
 *
 */
export interface IPropertyFieldCustomListHostProps extends IPropertyFieldCustomListPropsInternal {
}

export interface IPropertyFieldCustomListHostState {
  data?: any[];
  openPanel?: boolean;
  openListView?: boolean;
  openListAdd?: boolean;
  openListEdit?: boolean;
  selectedIndex?: number;
  hoverColor?: string;
  deleteOpen?: boolean;
  editOpen?: boolean;
  mandatoryOpen?: boolean;
  missingField?: string;
  items: any[];
  columns: any[];
  listKey: string;
  selection: Selection;
}

/**
 * @class
 * Renders the controls for PropertyFieldCustomList component
 */
export default class PropertyFieldCustomListHost extends React.Component<IPropertyFieldCustomListHostProps, IPropertyFieldCustomListHostState> {

  private _key: string;

  /**
   * @function
   * Contructor
   */
  constructor(props: IPropertyFieldCustomListHostProps) {
    super(props);
    //Bind the current object to the external called onSelectDate method
    this.saveWebPart = this.saveWebPart.bind(this);
    this.onOpenPanel = this.onOpenPanel.bind(this);
    this.onClickAddItem = this.onClickAddItem.bind(this);
    this.onClickCancel = this.onClickCancel.bind(this);
    this.onClickAdd = this.onClickAdd.bind(this);
    this.onClickDeleteItem = this.onClickDeleteItem.bind(this);
    this.onDismissDelete = this.onDismissDelete.bind(this);
    this.clickDelete = this.clickDelete.bind(this);
    this.onClickEdit = this.onClickEdit.bind(this);
    this.onClickUpdate = this.onClickUpdate.bind(this);
    this.onPropertyChange = this.onPropertyChange.bind(this);
    this.onPropertyChangeJson = this.onPropertyChangeJson.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onClickMoveUp = this.onClickMoveUp.bind(this);
    this.onClickMoveDown = this.onClickMoveDown.bind(this);
    this._key = GuidHelper.getGuid();

    this.state = {
      data: this.props.value != null ? this.props.value : [],
      openPanel: false,
      openListView: true,
      openListAdd: false,
      openListEdit: false,
      deleteOpen: false,
      editOpen: false,
      mandatoryOpen: false,
      missingField: '',
      items: [],
      columns: [],
      listKey: GuidHelper.getGuid(),
      selection: new Selection({ onSelectionChanged: this.OnSelectionChanges.bind(this) })
    };
    this.initItems();
    this.initColumns();
  }

  private initItems() {
    var items = [];
    if (this.state.data != null) {
      this.state.data.map((value: any, index: number) => {
        var item = {};
        this.props.fields.map((field: ICustomListField, indexI: number) => {
          if (value != null && field != null && (field.hidden == null || field.hidden === false)) {
            item[field.title] = value[field.id];
          }
        });
        items.push(item);
      });
    }
    if (this.state.items.length > 0) {
      this.state.items.splice(0, this.state.items.length);
    }
    this.setState({ items: this.state.items.push.apply(this.state.items, items) });
    this.setState(this.state);
  }

  private initColumns() {
    if (this.state.columns.length > 0) {
      this.state.columns.splice(0, this.state.columns.length);
    }
    let columns = buildColumns(this.state.items, true, null, '', false, '', true);
    this.setState({ columns: this.state.columns.push.apply(this.state.columns, columns) });
    this.setState(this.state);
  }

  /**
   * @function
   * Function called when the ColorPicker Office UI Fabric component selected color changed
   */
  private saveWebPart(value: any[]): void {
    //Checks if there is a method to called
    if (this.props.onPropertyChange && value != null) {
      this.props.properties[this.props.targetProperty] = value;
      this.props.onPropertyChange(this.props.targetProperty, [], value);
      if (!this.props.disableReactivePropertyChanges && this.props.render != null)
        this.props.render();
    }
  }

  private onOpenPanel(element?: any): void {
    this.setState({
      openPanel: true,
      openListView: true,
      openListAdd: false,
      editOpen: false,
      mandatoryOpen: false
    });
  }

  private onCancel(element?: any): void {
    this.setState({
      openPanel: false,
      openListView: false,
      openListAdd: false,
      editOpen: false,
      mandatoryOpen: false
    });
  }

  private onClickAddItem(element?: any): void {
    this.setState({
      openListView: false,
      openListAdd: true,
      openListEdit: false,
      editOpen: false,
      mandatoryOpen: false
    });
  }

  private onClickDeleteItem(element?: any): void {
    this.setState({
      deleteOpen: true
    });
  }

  private onClickCancel(): void {
    this.setState({
      openListView: true,
      openListAdd: false,
      openListEdit: false,
      editOpen: false,
      mandatoryOpen: false
    });
  }

  private onClickAdd(): void {
    var result = new Object();
    for (var i = 0; i < this.props.fields.length; i++) {
      if (this.props.fields[i] == null)
        continue;
      var ctrl = document.getElementById('input-' + this.props.fields[i].id);
      if (ctrl == null)
        continue;
      var str = ctrl['value'];
      if (this.props.fields[i].required === true && (str == null || str == '')) {
        this.setState({
          mandatoryOpen: true,
          missingField: this.props.fields[i].id
        });
        document.getElementById('input-' + this.props.fields[i].id).focus();
        return;
      }
      result[this.props.fields[i].id] = str;
    }
    this.state.data.push(result);
    let selectedIndex = this.getSelectedIndex();
    if (selectedIndex >= 0) {
      this.state.selection.setIndexSelected(selectedIndex, false, false);
    }
    this.initItems();
    if (this.state.columns == null || this.state.columns.length === 0)
      this.initColumns();
    this.saveWebPart(this.state.data);
    this.onClickCancel();
  }


  private onDismissDelete(element?: any): void {
    this.setState({ deleteOpen: false });
  }

  private onClickMoveUp(element?: any): void {
    var indexToMove: number = Number(this.getSelectedIndex());
    if (indexToMove > 0) {
      var obj = this.state.data[indexToMove - 1];
      this.state.data[indexToMove - 1] = this.state.data[indexToMove];
      this.state.data[indexToMove] = obj;
      for (var column in obj) {
        this.state.items[indexToMove - 1][column] = this.state.data[indexToMove - 1][column];
        this.state.items[indexToMove][column] = this.state.data[indexToMove][column];
      }
      this.state.selection.setIndexSelected(indexToMove, false, false);
      this.state.selection.setIndexSelected(indexToMove - 1, true, true);
      this.saveWebPart(this.state.data);
    }
  }

  private onClickMoveDown(element?: any): void {
    var indexToMove: number = Number(this.getSelectedIndex());
    if (indexToMove < this.state.data.length - 1) {
      var dataRestore = this.state.data[indexToMove + 1];
      this.state.data[indexToMove + 1] = this.state.data[indexToMove];
      this.state.data[indexToMove] = dataRestore;
      for (var column in dataRestore) {
        this.state.items[indexToMove + 1][column] = this.state.data[indexToMove + 1][column];
        this.state.items[indexToMove][column] = this.state.data[indexToMove][column];
      }
      this.state.selection.setIndexSelected(indexToMove, false, false);
      this.state.selection.setIndexSelected(indexToMove + 1, true, true);
      this.initItems();
      this.saveWebPart(this.state.data);
    }
  }

  private clickDelete(element?: any): void {
    var indexToDelete = this.getSelectedIndex();
    this.state.data.splice(indexToDelete, 1);
    this.setState({ items: this.state.items.filter((item, index) => index !== indexToDelete) });
    this.state.selection.setAllSelected(false);
    this.setState({ selectedIndex: null });
    this.onDismissDelete();
    this.saveWebPart(this.state.data);
  }

  private onClickEdit(element?: any): void {
    this.setState({
      editOpen: true,
      openListView: false
    });
  }

  private onClickUpdate(element?: any): void {
    let selectedIndex = this.getSelectedIndex();
    var result = this.state.data[selectedIndex];
    for (var i = 0; i < this.props.fields.length; i++) {
      if (this.props.fields[i] == null)
        continue;
      var ctrl = document.getElementById('input-' + this.props.fields[i].id);
      if (ctrl == null)
        continue;
      var str = ctrl['value'];
      if (this.props.fields[i].required === true && (str == null || str == '')) {
        this.setState({
          mandatoryOpen: true,
          missingField: this.props.fields[i].title
        });
        document.getElementById('input-' + this.props.fields[i].id).focus();
        return;
      }

      result[this.props.fields[i].id] = str;
    }
    this.initItems();
    this.saveWebPart(this.state.data);
    this.onClickCancel();
  }

  private onPropertyChange(targetProperty: string, oldValue?: any, newValue?: any): void {
    var input = document.getElementById(targetProperty);
    input['value'] = newValue;
  }

  private onPropertyChangeJson(targetProperty: string, oldValue?: any, newValue?: any): void {
    var input = document.getElementById(targetProperty);
    input['value'] = JSON.stringify(newValue);
  }

  private OnSelectionChanges() {
    if (this.state.selection.count <= 0) {
      if (this.state.selectedIndex !== null) {
        this.setState({ selectedIndex: null });
      }
    }
    else {
      let selectedIndex = this.state.selection.getSelectedIndices()[0];
      this.setState({ selectedIndex: selectedIndex });
    }
  }

  private getSelectedIndex() {
    if (this.state.selection.count > 0) {
      return this.state.selection.getSelectedIndices()[0];
    } else {
      return -1;
    }
  }

  /**
   * @function
   * Renders the datepicker controls with Office UI  Fabric
   */
  public render(): JSX.Element {

    //Renders content
    return (
      <div style={{ marginBottom: '8px' }}>
        <Label>{this.props.label}</Label>


        <Dialog type={DialogType.close} isOpen={this.state.openPanel} title={this.props.headerText} onDismiss={this.onCancel}
          containerClassName={styles.msDialogMainCustom} isDarkOverlay={true} isBlocking={false}>

          <div style={{ width: '630px', height: '500px', overflow: 'auto' }}>

            {this.state.openListAdd === true ?
              <div>
                {this.props.fields != null ?
                  <div>
                    <CommandBar
                      isSearchBoxVisible={false}
                      items={[
                        { key: 'Add', icon: 'Add', title: strings.CustomListAddItem, name: 'Add', disabled: true, onClick: this.onClickAdd },
                        { key: 'Back', icon: 'Back', title: strings.CustomListBack, name: 'Back', onClick: this.onClickCancel }
                      ]}
                    />
                    {this.state.mandatoryOpen === true ?
                      <MessageBar>
                        {strings.CustomListFieldMissing.replace("{0}", this.state.missingField)}
                      </MessageBar>
                      : ''}
                    <table className="ms-Table" cellSpacing="0" style={{ marginTop: '30px', width: '100%', paddingRight: '10px' }}>
                      <tbody>
                        {
                          this.props.fields.map((value: ICustomListField, indexF: number) => {
                            return (
                              <tr key={this._key + '-customListTr1-' + indexF}>
                                <td><Label>{value.title}
                                  {value.required === true ? ' (*)' : ''}
                                </Label></td>
                                <td>
                                  {value.type == CustomListFieldType.string ?
                                    <input id={'input-' + value.id} className={styles.customTextField} style={{ marginBottom: '8px' }} />
                                    : ''
                                  }
                                  {value.type == CustomListFieldType.number ?
                                    <input type="number" role="spinbutton" id={'input-' + value.id} max="99999" min="-999999" value="0" className={styles.customTextField} style={{ width: '100px', marginBottom: '8px' }} />
                                    : ''
                                  }
                                  {value.type == CustomListFieldType.boolean ?
                                    <div style={{ marginBottom: '8px' }}>
                                      <input id={'input-' + value.id} type="hidden" style={{ visibility: 'hidden' }} />
                                      <input type="radio" role="radio" aria-checked="false" name={'input-' + value.id} style={{ width: '18px', height: '18px' }} value={'input-' + value.id} onChange={
                                        (elm: any) => {
                                          if (elm.currentTarget.checked == true) {
                                            var name = elm.currentTarget.value;
                                            var input = document.getElementById(name);
                                            input['value'] = true;
                                          }
                                        }
                                      } /> <span style={{ fontSize: '14px' }}>{strings.CustomListTrue}</span>
                                      <input type="radio" role="radio" aria-checked="false" name={'input-' + value.id} style={{ width: '18px', height: '18px' }} value={'input-' + value.id} onChange={
                                        (elm: any) => {
                                          if (elm.currentTarget.checked == true) {
                                            var name = elm.currentTarget.value;
                                            var input = document.getElementById(name);
                                            input['value'] = false;
                                          }
                                        }
                                      } /> <span style={{ fontSize: '14px' }}>{strings.CustomListFalse}</span>
                                    </div>
                                    : ''
                                  }
                                  {value.type == CustomListFieldType.date ?
                                    <div>
                                      <input id={'input-' + value.id} type="hidden" style={{ visibility: 'hidden' }} />
                                      <PropertyFieldDatePickerHost render={null} key={'input-' + value.id} label="" properties={this.props.properties} onDispose={null} onRender={null} onPropertyChange={this.onPropertyChange} targetProperty={'input-' + value.id} />
                                    </div>
                                    : ''
                                  }
                                  {value.type == CustomListFieldType.dateTime ?
                                    <div>
                                      <input id={'input-' + value.id} type="hidden" style={{ visibility: 'hidden' }} />
                                      <PropertyFieldDateTimePickerHost render={null} key={'input-' + value.id} label="" properties={this.props.properties} onDispose={null} onRender={null} onPropertyChange={this.onPropertyChange} targetProperty={'input-' + value.id} />
                                    </div>
                                    : ''
                                  }
                                  {value.type == CustomListFieldType.picture ?
                                    <div>
                                      <input id={'input-' + value.id} type="hidden" style={{ visibility: 'hidden' }} />
                                      <PropertyFieldPicturePickerHost render={null} key={'input-' + value.id} label="" properties={this.props.properties} context={this.props.context} onDispose={null} onRender={null} onPropertyChange={this.onPropertyChange} targetProperty={'input-' + value.id} />
                                    </div>
                                    : ''
                                  }
                                </td>
                              </tr>
                            );
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                  : ''
                }
                <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                  <PrimaryButton style={{ marginRight: '10px' }} onClick={this.onClickAdd}>{strings.CustomListOK}</PrimaryButton>
                  <DefaultButton onClick={this.onClickCancel}>{strings.CustomListCancel}</DefaultButton>
                </div>
              </div>
              : ''}

            {this.state.editOpen === true ?
              <div>
                {this.props.fields != null ?
                  <div>
                    <CommandBar
                      isSearchBoxVisible={false}
                      items={[
                        { key: 'Edit', icon: 'Edit', title: strings.CustomListEdit, name: 'Edit', disabled: true, onClick: this.onClickEdit },
                        { key: 'Back', icon: 'Back', title: strings.CustomListBack, name: 'Back', onClick: this.onClickCancel }
                      ]}
                    />
                    {this.state.mandatoryOpen === true ?
                      <div className="ms-MessageBar">
                        <a className="anchorMessageBar"></a>
                        <div className="ms-MessageBar-content">
                          <div className="ms-MessageBar-icon">
                            <i className="ms-Icon ms-Icon--Error"></i>
                          </div>
                          <div className="ms-MessageBar-text">
                            {strings.CustomListFieldMissing.replace("{0}", this.state.missingField)}
                          </div>
                        </div>
                      </div>
                      : ''}
                    <table className="ms-Table" cellSpacing="0" style={{ marginTop: '30px', width: '100%', paddingRight: '10px' }}>
                      <tbody>
                        {
                          this.props.fields.map((value: ICustomListField, indexM: number) => {
                            return (
                              <tr key={this._key + '-customListTr2-' + indexM}>
                                <td><Label>{value.title}
                                  {value.required === true ? ' (*)' : ''}
                                </Label></td>
                                <td>
                                  {value.type == CustomListFieldType.string ?
                                    <input id={'input-' + value.id} className={styles.customTextField} style={{ marginBottom: '8px' }} defaultValue={this.state.data[this.getSelectedIndex()][value.id]} />
                                    : ''
                                  }
                                  {value.type == CustomListFieldType.number ?
                                    <input type="number" role="spinbutton" id={'input-' + value.id} className={styles.customTextField} defaultValue={this.state.data[this.getSelectedIndex()][value.id]} max="99999" min="-999999" aria-valuenow={this.state.data[this.getSelectedIndex()][value.id]} style={{ width: '100px', marginBottom: '8px' }} />
                                    : ''
                                  }
                                  {value.type == CustomListFieldType.boolean ?
                                    <div style={{ marginBottom: '8px' }}>
                                      <input id={'input-' + value.id} type="hidden" defaultValue={this.state.data[this.getSelectedIndex()][value.id]} style={{ visibility: 'hidden' }} />
                                      <input type="radio" role="radio" name={'input-' + value.id} style={{ width: '18px', height: '18px' }} value={'input-' + value.id} onChange={
                                        (elm: any) => {
                                          if (elm.currentTarget.checked == true) {
                                            var name = elm.currentTarget.value;
                                            var input = document.getElementById(name);
                                            input['value'] = true;
                                          }
                                        }
                                      }
                                        defaultChecked={this.state.data[this.getSelectedIndex()][value.id] == "true"}
                                        aria-checked={this.state.data[this.getSelectedIndex()][value.id] == "true"}
                                      />
                                      <span style={{ fontSize: '14px' }}>{strings.CustomListTrue}</span>
                                      <input type="radio" role="radio" name={'input-' + value.id} style={{ width: '18px', height: '18px' }} value={'input-' + value.id} onChange={
                                        (elm: any) => {
                                          if (elm.currentTarget.checked == true) {
                                            var name = elm.currentTarget.value;
                                            var input = document.getElementById(name);
                                            input['value'] = false;
                                          }
                                        }
                                      }
                                        defaultChecked={this.state.data[this.getSelectedIndex()][value.id] == "false"}
                                        aria-checked={this.state.data[this.getSelectedIndex()][value.id] == "false"}
                                      /> <span style={{ fontSize: '14px' }}>{strings.CustomListFalse}</span>
                                    </div>
                                    : ''
                                  }
                                  {value.type == CustomListFieldType.date ?
                                    <div>
                                      <input id={'input-' + value.id} type="hidden" defaultValue={this.state.data[this.getSelectedIndex()][value.id]} style={{ visibility: 'hidden' }} />
                                      <PropertyFieldDatePickerHost render={null} key={'input-' + value.id} properties={this.props.properties} initialDate={this.state.data[this.getSelectedIndex()][value.id]} label="" onDispose={null} onRender={null} onPropertyChange={this.onPropertyChange} targetProperty={'input-' + value.id} />
                                    </div>
                                    : ''
                                  }
                                  {value.type == CustomListFieldType.dateTime ?
                                    <div>
                                      <input id={'input-' + value.id} type="hidden" defaultValue={this.state.data[this.getSelectedIndex()][value.id]} style={{ visibility: 'hidden' }} />
                                      <PropertyFieldDateTimePickerHost render={null} key={'input-' + value.id} properties={this.props.properties} initialDate={this.state.data[this.getSelectedIndex()][value.id]} label="" onDispose={null} onRender={null} onPropertyChange={this.onPropertyChange} targetProperty={'input-' + value.id} />
                                    </div>
                                    : ''
                                  }
                                  {value.type == CustomListFieldType.picture ?
                                    <div>
                                      <input id={'input-' + value.id} type="hidden" defaultValue={this.state.data[this.getSelectedIndex()][value.id]} style={{ visibility: 'hidden' }} />
                                      <PropertyFieldPicturePickerHost render={null} initialValue={this.state.data[this.getSelectedIndex()][value.id]} key={'input-' + value.id} properties={this.props.properties} label="" context={this.props.context} onDispose={null} onRender={null} onPropertyChange={this.onPropertyChange} targetProperty={'input-' + value.id} />
                                    </div>
                                    : ''
                                  }
                                </td>
                              </tr>
                            );
                          })
                        }
                      </tbody>
                    </table>
                  </div>
                  : ''
                }
                <div style={{ marginTop: '30px', marginBottom: '30px' }}>
                  <PrimaryButton style={{ marginRight: '10px' }} onClick={this.onClickUpdate}>{strings.CustomListOK}</PrimaryButton>
                  <DefaultButton onClick={this.onClickCancel}>{strings.CustomListCancel}</DefaultButton>
                </div>



              </div>
              : ''}

            {this.state.openListView === true ?
              <div>
                <CommandBar
                  isSearchBoxVisible={false}
                  items={[
                    { key: 'Add', icon: 'Add', title: strings.CustomListAddItem, name: 'Add', onClick: this.onClickAddItem },
                    { key: 'Edit', icon: 'Edit', title: strings.CustomListEdit, name: 'Edit', onClick: this.onClickEdit, disabled: (this.getSelectedIndex() < 0) ? true : false },
                    { key: 'Delete', icon: 'Delete', title: strings.CustomListDel, name: 'Delete', onClick: this.onClickDeleteItem, disabled: (this.getSelectedIndex() < 0) ? true : false },
                    { key: 'Up', icon: 'ChevronUp', title: '', name: '', onClick: this.onClickMoveUp, disabled: (this.getSelectedIndex() <= 0) ? true : false },
                    { key: 'Down', icon: 'ChevronDown', title: '', name: '', onClick: this.onClickMoveDown, disabled: ((this.getSelectedIndex() >= (this.state.data.length - 1)) || (this.getSelectedIndex() === -1)) ? true : false }
                  ]}
                />

                <Dialog type={DialogType.close} isOpen={this.state.deleteOpen} title={strings.CustomListConfirmDel}
                  onDismiss={this.onDismissDelete} isDarkOverlay={false} isBlocking={true}>
                  <div>
                    <div>
                      <Label>{strings.CustomListConfirmDelMssg}</Label>
                    </div>
                    <div style={{ paddingTop: '20px' }}>
                      <PrimaryButton onClick={this.clickDelete}>{strings.CustomListYes}</PrimaryButton>
                      <DefaultButton onClick={this.onDismissDelete}>{strings.CustomListNo}</DefaultButton>
                    </div>
                  </div>
                </Dialog>

                {this.props.fields != null ?

                  <div style={{ marginTop: '20px' }}>

                    <DetailsList
                      setKey={this.state.listKey}
                      items={this.state.items}
                      columns={this.state.columns}
                      selectionPreservedOnEmptyClick={true}
                      checkboxVisibility={CheckboxVisibility.onHover}
                      layoutMode={LayoutMode.justified}
                      isHeaderVisible={true}
                      selection={this.state.selection}
                      selectionMode={SelectionMode.single}
                      constrainMode={ConstrainMode.unconstrained}
                    />

                  </div>
                  : ''}

              </div>
              : ''}

          </div>
        </Dialog>

        <DefaultButton disabled={this.props.disabled} onClick={this.onOpenPanel}>{this.props.headerText}</DefaultButton>

      </div>
    );
  }
}