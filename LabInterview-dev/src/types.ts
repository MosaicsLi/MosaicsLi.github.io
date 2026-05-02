/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * 教授訪問紀錄的資料結構
 */
export interface Professor {
  /** 唯一識別符 */
  id: string;
  /** 教授姓名 */
  name: string;
  /** 研究室名稱或實驗室 */
  lab: string;
  /** 是否已完成訪問 */
  visited: boolean;
  /** 登記日期或訪問日期 */
  date: string;
  /** 相關備註或特記事項 */
  notes: string;
}
