import wektor from '@/wektor'
import { getBounds } from '@/utils'
import paper from 'paper'
const { Path, CompoundPath, Group, Point } = paper

class StielaugeLinkBase extends Group {
	constructor(prevLink) {
		super({ iterable: false })
		this.prevLink = prevLink
		this.create()
		this.applyMatrix = false
	}
	
	create() {
		this.content = this.createContent()
		this.content.applyMatrix = false
		
		if (this.prevLink) {
			const mask = this.createMask()
			this.addChild(mask)
			this.clipped = true
		}

		this.addChild(this.content)
	}
	
	createChild() {
		
	}
	
	createMask() {
		const rect = new Path.Rectangle({
			width: 300,
			height: 300,
			guide: true,
			insert: false,
		})
		const outer = this.prevLink.content.children['filling']
			? this.prevLink.content.children['filling'].children['outer']
			: this.prevLink.content.children['outer']
		rect.position = outer.position
		const mask = rect.subtract(outer, { insert: false })
		mask.guide = true
		mask.applyMatrix = false
		mask.pivot = this.prevLink.content.pivot
		this.prevLink.data.mask = mask
		
		return mask
	}
}

class StielaugeLink extends StielaugeLinkBase {
	set selected(value) {
		this.content.children['filling'].selected = true
	}

	createContent() {
		const fill = new CompoundPath(`M48,17c0,1.7-1.3,3-3,3c-3.3,0-6.4,2.6-9.9,5.6c-4.7,4-10,8.4-17.7,8.4C7.8,34,0,26.4,0,17
	c0-4.5,1.8-8.7,5-11.9C8.3,1.8,12.7,0,17.4,0c7.7,0,13,4.5,17.7,8.4c3.5,3,6.6,5.6,9.9,5.6C46.7,14,48,15.3,48,17z M6,17
	c0,6.1,5.1,11,11.4,11c3,0,5.6-1,8-2.5c9.3-5.8,9.3-11.2,0-16.9c-2.4-1.5-5-2.5-8-2.6c-3.1,0-6,1.2-8.1,3.3C7.1,11.4,6,14.1,6,17z`)
		fill.set({
			name: 'filling',
			fillColor: 'white',
			strokeWidth: 0,
			selectable: false,
			iterable: false,
		})
		fill.children[0].set({
			name: 'outer',
			selectable: false,
			iterable: false,
		})
		fill.children[1].set({
			name: 'inner',
			selectable: false,
			iterable: false,
		})
		fill.on('contextmenu', event => this.emit('contextmenu', event))
		
		const outline = new Path(`M48.5,20.5h-3c-3.3,0-6.4,2.6-9.9,5.6c-4.7,4-10,8.4-17.7,8.4
	c-9.6,0-17.4-7.6-17.4-17c0-4.5,1.8-8.7,5-11.9c3.3-3.3,7.7-5.1,12.4-5.1c7.7,0,13,4.5,17.7,8.4c3.5,3,6.6,5.6,9.9,5.6h3`)
		outline.set({
			name: 'outline',
			strokeColor: 'black',
			guide: true,
		})

		const inline = new Path(`M0.5,11.5c0,6.1,5.1,11,11.4,11c3,0,5.6-1,8-2.5 c9.3-5.8,9.3-11.2,0-16.9c-2.4-1.5-5-2.5-8-2.6c-3.1,0-6,1.2-8.1,3.3C1.6,5.9,0.5,8.6,0.5,11.5z`)  
		inline.position = inline.position.add([6, 6])   
		inline.set({
			name: 'inline',
			strokeColor: 'black',
			guide: true,
		})
		
		const content = new Group({
			children: [fill, inline, outline],
			iterable: false,
		})
		content.pivot = [48, 17]
		return content
	}

	set strokeWidth(value) {
		this.content.children['outline'].strokeWidth = value
		this.content.children['inline'].strokeWidth = value
	} 	
}

class StielaugeEyeball extends StielaugeLinkBase {
	createContent() {
		const fill = new CompoundPath(`M48,17c0,1.7-1.3,3-3,3c-3.3,0-6.4,2.6-9.9,5.6c-4.7,4-10,8.4-17.7,8.4C7.8,34,0,26.4,0,17
		c0-4.5,1.8-8.7,5-11.9C8.3,1.8,12.7,0,17.4,0c7.7,0,13,4.5,17.7,8.4c3.5,3,6.6,5.6,9.9,5.6C46.7,14,48,15.3,48,17z`)
		fill.set({
			name: 'outer',
			fillColor: 'white',
			strokeWidth: 0,
			selectable: false,
			iterable: false,
		})
		fill.on('contextmenu', event => this.emit('contextmenu', event))
		for (const child of fill.children) {
			child.set({
				selectable: false,
				iterable: false,
			})
		}

		const outline = new Path(`MM48.5,20.5h-3c-3.3,0-6.4,2.6-9.9,5.6c-4.7,4-10,8.4-17.7,8.4
		c-9.6,0-17.4-7.6-17.4-17c0-4.5,1.8-8.7,5-11.9c3.3-3.3,7.7-5.1,12.4-5.1c7.7,0,13,4.5,17.7,8.4c3.5,3,6.6,5.6,9.9,5.6h3`)
		outline.set({
			name: 'outline',
			strokeColor: 'black',
			guide: true,
		})

		const pupil = new Path('M9.7,9.8c-2.1,2.1-3.2,4.8-3.2,7.7c0,3,1.2,5.7,3.2,7.6')
		pupil.set({
			name: 'pupil',
			strokeColor: 'black',
			guide: true,
		})

		const content = new Group({
			children: [fill, outline, pupil],
			iterable: false,
		})
		content.pivot = [48, 17]
		return content
	}

	set strokeWidth(value) {
		this.content.children['outline'].strokeWidth = value
		this.content.children['pupil'].strokeWidth = value
	}     
}

class StielaugeSkeleton extends Path {
	constructor(spec) {
		super({ guide: true })
		this.set({
			spec,
			strokeColor: 'white',
		})
		this.create()
		this.thickness = 6
		this.strokeWidth = 1
	}
	
	set strokeColor(value) {
		if (this.outline)
			this.outline.strokeColor = value
		else
			super.strokeColor = value
	}

	set thickness(value) {
		this._thickness = value

		if (this.outline)
			this.outline.strokeWidth = value + this.strokeWidth
		
		super.strokeWidth = value - this.strokeWidth
	}

	get thickness() {
		return this._thickness
	}
	
	set strokeWidth(value) {
		this._strokeWidth = value

		if (this.outline)
			this.outline.strokeWidth = this.thickness + this.strokeWidth
		
		super.strokeWidth = this.thickness - this.strokeWidth
	}

	get strokeWidth() {
		return this._strokeWidth
	}
	
	set fillColor(value) {
		super.strokeColor = value
	}
	
	create() {
		const { length, points } = this.spec
		
		const start = new Point([0, 0])
		for (let i = 0; i < points; i++)
			this.add(new Point(i * length, 0).add(start)) 
			
		this.outline = new Path({
			strokeColor: 'black',
			strokeWidth: 20, 
			iterable: false,  
			selectable: false,        
		})
		this.outline.insertBelow(this)
	}    
	
	remove() {
		this.outline.remove()
		super.remove()
	}
	
	update(target) {
		const { position, length, points } = this.spec
		
		this.firstSegment.point = target
		for (let i = 0; i < points - 1; i++) {
			const segment = this.segments[i]
			const nextSegment = segment.next
			const vector = segment.point.subtract(nextSegment.point)
			vector.length = length
			nextSegment.point = segment.point.subtract(vector)
		}
		
		const offset = position.subtract(this.lastSegment.point)
		for (let i  = 0; i < points; i++ ) {
			const segment = this.segments[i]
			segment.point = segment.point.add(offset)          
		}
		
		this.smooth()
		this.outline.segments = this.segments
	}    
}

class Stielauge extends Group {
	constructor(owner, spec) {
		super({ iterable: false })

		spec = Object.assign({
			length: 20,
			links: 3,
			position: [0, 0],
			strokeWidth: 1,
		}, spec)
		spec.points = spec.links + 2
		spec.position = new Point(spec.position)
		this.spec = spec
		this.owner = owner

		this.create()
		this.set({
			fillColor: 'white',
			strokeColor: 'black',
			strokeWidth: 1,
		})		
		this.on('contextmenu', event => {
			if (!this.dialogReference) {
				const self = this
				this.dialogReference = {
					position: { x: 0, y: 0 },
					enabled: true,
					update() {
						const position = self.skeleton.firstSegment.point
						this.position.x = position.x
						this.position.y = position.y
					}
				}
				this.dialogReference.update()
			}

			this.dialogReference.enabled = true
			const dialogId = this.constructor.name + this.id
			wektor.openDialog({
				id: dialogId,
				layout: {
					group: {
						align: 'columns',
						label: 'stroke',			
						strokeWidth: {
							type: 'number',
							unit: 'px',
							units: 'distances',				
						},
						strokeColor: {
							type: 'color',
						},						
					},					
					fillColor: {
						type: 'color',
						label: 'fill color',
					},
					advanced: {
						type: 'folder',
						label: 'advanced',
						open: false,
						links: {
							type: 'number',
							label: 'links',
							min: 1,
							max: 10,
						},
					},
				},
				values: this,
				reference: this.dialogReference,
				css: {
					right: '270px',
					bottom: '230px',
				},
			})

			wektor.on('closeDialog', dialog => {
				if (dialog.id === dialogId)
					this.dialogReference.enabled = false
			})
		})
	}
	
	create() {
		this.skeleton = new StielaugeSkeleton(this.spec)
		this.addChild(this.skeleton)
		this.linksGroup = this.createLinks()
		this.fillColor = this.spec.fillColor
		this.strokeColor = this.spec.strokeColor
		this.addChildren([this.skeleton.outline, this.skeleton, this.linksGroup])
		this.strokeWidth = this.spec.strokeWidth
	}
	
	createLinks() {
		const { points } = this.spec
		const { skeleton } = this
		const linksGroup = new Group({ iterable: false, selectable: false })
		
		let prevLink
		for (let i = 1; i < points - 1; i++) {
			const segment = skeleton.segments[i]
			const isEyeball = (i === 1)
			const link = isEyeball
				? new StielaugeEyeball(prevLink)
				: new StielaugeLink(prevLink)

			link.on('contextmenu', event => this.emit('contextmenu', event))

			prevLink = link
			linksGroup.addChild(link)
		}

		linksGroup.reverseChildren()
		linksGroup.on('click', event => {
			if (event.event.button === 2) return false
			this.selected = true
		})

		return linksGroup
	}

	set selected(value) {
		for (const child of this.linksGroup.children)
			child.selected = true
		this.skeleton.selected = true
	}
	
	set position(value) {
		this.spec.position = new Point(value)
	}
	
	get position() {
		return this.spec.position
	}
	
	set links(value) {
		if (value === this.links) return

		this._links = value
		this.skeleton.lastSegment.remove()
		this.skeleton.remove()
		this.linksGroup.remove()
		this.spec.links = value
		this.spec.points = value + 2
		this.create()
		this.update({ point: new paper.Point([0, 0]) })	
		this.update({ point: new paper.Point([0, 0]) })	
	}
	
	get links() {
		return this._links || this.spec.links
	}
	
	set fillColor(value) {
		this._fillColor = value
		if (this.skeleton)
			this.skeleton.fillColor = value
		if (this.linksGroup) {
			for (const link of this.linksGroup.children) {
				if (link.content.children['filling'])
					link.content.children['filling'].fillColor = value
				else
					link.content.children['outer'].fillColor = value
			}
		}
		this.spec.fillColor = value
	}

	get fillColor() {
		return this._fillColor
	}
	
	set strokeColor(value) {
		this._strokeColor = value
		if (this.skeleton)
			this.skeleton.strokeColor = value
		if (this.linksGroup)
			this.linksGroup.strokeColor = value 
		this.spec.strokeColor = value
	}

	get strokeColor() {
		return this._strokeColor
	}

	set strokeWidth(value) {
		this._strokeWidth = value
		this.spec.strokeWidth = value
		this.skeleton.strokeWidth = value
		for (const child of this.linksGroup.children)
			child.strokeWidth = value
	}

	get strokeWidth() {
		return this._strokeWidth || this.spec.strokeWidth
	}
	
	update(event) {
		const { position, length, points } = this.spec
		const pathMaxLength = (points - 1) * length
		const vector = event.point.subtract(position)
		vector.length = pathMaxLength
		const target = position.add(vector) 

		if (target.y > (this.position.y - 20)) {
			target.y = this.position.y - 20
			target.x = this.position.x - pathMaxLength
		} 

		this.skeleton.update(target)
		this.updateLinks()	

		if (this.dialogReference && this.dialogReference.enabled)
			this.dialogReference.update()	
	}    
	
	updateLinks() {
		const { skeleton, linksGroup } = this
		const { points } = this.spec
		
		for (let i = 1; i < points - 1; i++) {
			const reverseIndex = (points - 1 - 1) - i
			const link = linksGroup.children[reverseIndex]
			const segment = skeleton.segments[i]
			const point = segment.point
			const pointOffset = skeleton.getOffsetOf(point)
			const tangent = skeleton.getTangentAt(pointOffset)
			
			const position = link.content.position = segment.point
			const angle = link.content.rotation = tangent.angle
			
			if (link.data.mask) {
				link.data.mask.position = position
				link.data.mask.rotation = angle
			}
		}
	}    
}

export { Stielauge, StielaugeSkeleton, StielaugeLinkBase, StielaugeLink, StielaugeEyeball }
export default Stielauge