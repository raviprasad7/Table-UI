const DOMUtils = (() => {
	const CLASS = {
		ROW: 'tb-row',
		ROW_HEADER: 'tb-row--header',
		COL: 'tb-cell-col',
		COL_STICKY: 'tb-col--sticky',
		CELL: 'tb-cell',
		CELL_HEADER: 'tb-cell--header',
		CELL_ROW_NO: 'tb-cell--row-number',
		CELL_SKELETON: 'tb-cell--skeleton'
	};
	return {
		CLASS: CLASS,
		createDiv(id, classList) {
			let ele = document.createElement('div');
			id && (ele.id = id);
			Array.isArray(classList) && ele.classList.add(...classList);
			return ele;
		},
		getHeaderRowHTML({showRowNumber, headers, stickyColumns}) {
			return `
				<div class="${CLASS.ROW} ${CLASS.ROW_HEADER}">
					${showRowNumber?`<div class="${CLASS.CELL} ${CLASS.CELL_HEADER} ${CLASS.CELL_ROW_NO}">#</div>`:``}
					${headers
						.map((col, colIndex) => {
							let classList = [`${CLASS.CELL}`, `${CLASS.COL}${colIndex}`, `${CLASS.CELL_HEADER}`];
							if(stickyColumns.includes(colIndex+1)) {
								classList.push(`${CLASS.COL_STICKY}`);
							}
							return `<div class="${classList.join(' ')}">${col}</div>`;
						}).join('')}
				</div>
			`;
		},
		getRowHTML(row, {stickyColumns}) {
			if(Array.isArray(row)) {
				return `${row
					.map((col, colIndex) => {
						let classList = [`${CLASS.CELL}`, `${CLASS.COL}${colIndex}`];
						(stickyColumns.includes(colIndex+1)) && (classList.push(`${CLASS.COL_STICKY}`));
						return `<div class="${classList.join(' ')}">${col}</div>`;
					}).join('')}`;
			}
		},
		getRowNumberHTML(rowIndex) {
			return `<div class="${CLASS.CELL} ${CLASS.CELL_ROW_NO}">${rowIndex + 1}</div>`;
		},
		getRowsHTML(rows, lastRowIndex, config) {
			if(Array.isArray(rows)) {
				return rows.map((row, rowIndex) => {
					rowIndex += lastRowIndex;
					return `
						<div class="${CLASS.ROW}" tb-row-index=${rowIndex} style="position:absolute; top: ${config.cellHeight*(rowIndex+1)}px;">
							${config.showRowNumber?this.getRowNumberHTML(rowIndex):``}
							${this.getRowHTML(row, config)}
						</div>
					`;
				}).join('');
			}
		},
		getRowSkeletonHTML(instance) {
			let { cellHeight, showRowNumber, headers, stickyColumns } = instance.config;
			let { rowChunkEnd } = instance;
			return `
				${Array(2).fill(0).map((val, index)=>{
					return `
						<div class="${CLASS.ROW}" style="position:absolute; top: ${cellHeight*(rowChunkEnd+index+1)}px;">
							${showRowNumber?`<div class="${CLASS.CELL} ${CLASS.CELL_ROW_NO}"><div class="${CLASS.CELL_SKELETON}"></div></div>`:``}
							${Array(headers.length).fill(0).map((col, colIndex)=>{
								let classList = [`${CLASS.CELL}`, `${CLASS.COL}${colIndex}`];
								(stickyColumns.includes(colIndex+1)) && (classList.push(`${CLASS.COL_STICKY}`));
								return `
									<div class="${classList.join(' ')}">
										<div class="${CLASS.CELL_SKELETON}"></div>
									</div>
								`;
							}).join('')}
						</div>
					`;
				}).join('')}
			`;
		}
	};
})();

export default DOMUtils;
