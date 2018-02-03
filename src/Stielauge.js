class StielaugeLinkBase extends Group {
    constructor(prevLink) {
        super()
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
        })
        
        const outer = this.prevLink.content.children['filling']
            ? this.prevLink.content.children['filling'].children['outer']
            : this.prevLink.content.children['outer']
        rect.position = outer.position
        const mask = rect.subtract(outer)
        mask.fillColor = 'yellow'
        mask.pivot = this.prevLink.content.pivot
        mask.applyMatrix = false
        this.prevLink.data.mask = mask
        rect.remove()
        
        return mask
    }
}

class StielaugeLink extends StielaugeLinkBase {
    createContent() {
        const fill = new CompoundPath(`M48,17c0,1.7-1.3,3-3,3c-3.3,0-6.4,2.6-9.9,5.6c-4.7,4-10,8.4-17.7,8.4C7.8,34,0,26.4,0,17
	c0-4.5,1.8-8.7,5-11.9C8.3,1.8,12.7,0,17.4,0c7.7,0,13,4.5,17.7,8.4c3.5,3,6.6,5.6,9.9,5.6C46.7,14,48,15.3,48,17z M6,17
	c0,6.1,5.1,11,11.4,11c3,0,5.6-1,8-2.5c9.3-5.8,9.3-11.2,0-16.9c-2.4-1.5-5-2.5-8-2.6c-3.1,0-6,1.2-8.1,3.3C7.1,11.4,6,14.1,6,17z`)
	    fill.set({
	        name: 'filling',
	        fillColor: 'white',
	        strokeWidth: 0,
	    })
	    fill.children[0].name = 'outer'
	    fill.children[1].name = 'inner'
	    
        const outline = new Path(`M48.5,20.5h-3c-3.3,0-6.4,2.6-9.9,5.6c-4.7,4-10,8.4-17.7,8.4
	c-9.6,0-17.4-7.6-17.4-17c0-4.5,1.8-8.7,5-11.9c3.3-3.3,7.7-5.1,12.4-5.1c7.7,0,13,4.5,17.7,8.4c3.5,3,6.6,5.6,9.9,5.6h3`)
	   outline.strokeColor = 'black'
	   
        const inline = new Path(`M0.5,11.5c0,6.1,5.1,11,11.4,11c3,0,5.6-1,8-2.5
	c9.3-5.8,9.3-11.2,0-16.9c-2.4-1.5-5-2.5-8-2.6c-3.1,0-6,1.2-8.1,3.3C1.6,5.9,0.5,8.6,0.5,11.5z`)	
        inline.position += [6, 6]	
        inline.strokeColor = 'black'
        
        const content = new Group([fill, outline, inline])
        content.pivot = [48, 17]
        return content
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
	    })
	    
        const outline = new Path(`MM48.5,20.5h-3c-3.3,0-6.4,2.6-9.9,5.6c-4.7,4-10,8.4-17.7,8.4
	c-9.6,0-17.4-7.6-17.4-17c0-4.5,1.8-8.7,5-11.9c3.3-3.3,7.7-5.1,12.4-5.1c7.7,0,13,4.5,17.7,8.4c3.5,3,6.6,5.6,9.9,5.6h3`)
	   outline.strokeColor = 'black'
	   
	   const pupil = new Path('M9.7,9.8c-2.1,2.1-3.2,4.8-3.2,7.7c0,3,1.2,5.7,3.2,7.6')
	   pupil.strokeColor = 'black'
	    
        const content = new Group([fill, outline, pupil])
        content.pivot = [48, 17]
        return content
    }    
}

class StielaugeSkeleton extends Path {
    constructor(spec) {
        super()
        this.set({
            spec,
            strokeColor: 'white',
        })
        this.create()
        this.strokeWidth = 7
    }
    
    set strokeColor(value) {
        if (this.outline)
            this.outline.strokeColor = value
        else
            super.strokeColor = value
    }
    
    set strokeWidth(value) {
        if (this.outline)
            this.outline.strokeWidth = value
        
        super.strokeWidth = value - 2
    }
    
    set fillColor(value) {
        super.strokeColor = value
    }
    
    create() {
        const { length, points } = this.spec
        
        const start = new Point([0, 0])
        for (let i = 0; i < points; i++)
            this.add(start + new Point(i * length, 0)) 
            
        this.outline = new Path({
            strokeColor: 'black',
            strokeWidth: 20,            
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
    		const vector = segment.point - nextSegment.point
    		vector.length = length
    		nextSegment.point = segment.point - vector
    	}
    	
    	const offset = position - this.lastSegment.point
    	for (let i  = 0; i < points; i++ ) {
    	    const segment = this.segments[i]
    	    segment.point = segment.point + offset    	    
    	}
    	
    	this.smooth()
    	this.outline.segments = this.segments
    }    
}

class Stielauge extends Group {
    constructor(spec) {
        super()
        
        spec = Object.assign({
            length: 20,
            links: 3,
            position: view.center,
            fillColor: 'red',
            strokeColor: 'black',
        }, spec)
        spec.points = spec.links + 2
        spec.position = new Point(spec.position)
        this.spec = spec
        
        this.create()
    }
    
    create() {
        this.skeleton = new StielaugeSkeleton(this.spec)
        this.linksGroup = this.createLinks()
        this.fillColor = this.spec.fillColor
        this.strokeColor = this.spec.strokeColor
    }
    
    createLinks() {
        const { points } = this.spec
        const { skeleton } = this
        const linksGroup = new Group()
        
        let prevLink
        for (let i = 1; i < points -1; i++) {
            const segment = skeleton.segments[i]
            const isEyeball = (i === 1)
            const link = isEyeball
                ? new StielaugeEyeball(prevLink)
                : new StielaugeLink(prevLink)
                
            prevLink = link
            linksGroup.addChild(link)
        }
        
        linksGroup.reverseChildren()
        return linksGroup
    }
    
    set position(value) {
        this.spec.position = new Point(value)
    }
    
    get position() {
        return this.spec.position
    }
    
    set links(value) {
        this.skeleton.lastSegment.remove()
        this.skeleton.remove()
        this.linksGroup.remove()
        this.spec.links = value
        this.spec.points = value + 2
        this.create()
    }
    
    get links() {
        return this.spec.links
    }
    
    set fillColor(value) {
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
    
    set strokeColor(value) {
        if (this.skeleton)
            this.skeleton.strokeColor = value
        if (this.linksGroup)
            this.linksGroup.strokeColor = value 
        this.spec.strokeColor = value
    }
    
    update(event) {
        const { position, length, points } = this.spec
        const pathMaxLength = (points - 1) * length
        const vector = event.point.subtract(position)
        
        let target
        if (vector.length > pathMaxLength) {
            vector.length = pathMaxLength
            target = position + vector
        } else {
            target = event.point
        }
        
        this.skeleton.update(target)
        this.updateLinks()
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

const s = new Stielauge({ links: 3 })
var g = new Group([s])
s.fillColor = 'red'

function onMouseDown(event) {
    s.links += 1
    s.update(event)
    s.update(event)
}

function onMouseMove(event) {
    s.update(event)
}

class Wek extends Group {
    constructor() {
        super()
        this.relativePositions = {
            eyes: {
                left: [45, 84],
                right: [105, 84],
            }
        }
            
        this.create()
    }
    
    create() {
        this.below = new Group({
            children: [
                new Path('M28.8,114 c0,0,14.4,10.7,25.4-7.5'),
                new Path('M95.2,109.7 c0,0,5.8,10.1,21.7,10.1'),
                
                // eyesocket left
                new Path('M58.9,83.8 c0,0-3.2-10.3-12.4-10.3c-7,0-9,2.7-12.3,9.7'),
                
                // eyesocket right
                new Path('M93.5,84.3 c0,0,3.2-10.3,12.4-10.3c7,0,9,2.7,12.3,9.7'),
                
                // mouth
                new Path('M91.4,144.3 c1.9-4.6-6.1-15-9.7-20.3c-1-1.5-3.2-1.6-4.5-0.3l-2.5,4c-0.4,0.6-1.2,0.5-1.5-0.2L72,124c-0.4-1-1.7-1.3-2.5-0.6l-17.7,16.2'),
                new Path('M55.9,139.3 c0,0,9.7-0.5,18.5,0.6c8.7,1.1,11,0.8,16.8,4.1'),
                new Path('M52.5,140.1 c0,0,6.8,14.3,20,14c13.3-0.2,18.9-9.6,18.9-9.6l-4.1-6.4c0,0-6.1-3.5-6.9-8.7c-2.2,3.1-11,6.3-14.7,2.7c-4,9.5-13.2,7-13.2,7'),
                new Path('M64.7,134.5 c1.2,1.8,0.7,4.5,0.7,4.5s0.2-5.4,2.8-5.6'),
                new Path('M70.6,133.9 c0,0,1.3,0.5,1,5.6c0.1-0.1,0.4-6,3.8-6.7c3.4-0.7,3.7,4.9,3.3,7.3c0.2-1.4,0.4-6.2,3.7-6.2'),    
                
                // nose
                new Path('M67.9,114.6 c0,0-3.9,3.9-0.6,10.8'),
                new Path('M84.8,112.9 c0,0,4.5,6-1.2,13.7'),
                
                // ohren
                new Path('M17,90 c0,0-0.2-12.4-5.3-22S4.1,58.9,3,59.5c-1.1,0.6-3.5,2.1,3.8,11.1c-2.9-2.5-4.3-3-5.2-2.5c-0.4,0.2-2.3,0.7,0.3,7.2 c2.6,6.5,7.5,25.2,8.6,27.7c3,6.8,7.2,11.9,7.2,11.9'),
                new Path('M133,89.7 c0,0,0.2-12.4,5.3-22s7.6-9.1,8.7-8.5c1.1,0.6,3.5,2.1-3.8,11.1c2.9-2.5,4.3-3,5.2-2.5c0.4,0.2,2.3,0.7-0.3,7.2 c-2.6,6.5-7.5,25.2-8.6,27.7c-3,6.8-7.2,11.9-7.2,11.9'),
                new Path('M132.9,97 c0,53.3-25.9,96.5-57.8,96.5S17.2,150.3,17.2,97S21.1,0.5,75.1,0.5C128.1,0.5,132.9,43.7,132.9,97z'),   
            ],
            strokeColor: 'black',
        })
        
        this.above = new Group({
            children: [
                new Path('M65.5,89.5 c0,0-2.5-5.7-7.3-5.7l-24.4-0.5c-5.3,0.3-6.5-5.5-6.5-5.5'),
                new Path('M86.9,89.9c0,0,2.5-5.7,7.3-5.7l24.4-0.5c5.3,0.3,6.5-5.5,6.5-5.5'),
            ],
            strokeColor: 'black',
        })
        
        this.addChildren([this.above, this.below])
        
        this.createEyes()
    }
    
    createEyes() {
        const left = new Stielauge({
            position: this.relativePositions.eyes.left,
        })
        
        const right = new Stielauge({
            position: this.relativePositions.eyes.right,
        })
        
        this.addChildren([left, right])
        this.eyes = { left, right }
    }
    
    update(event) {
        const { left, right } = this.eyes
        left.update(event)
        right.update(event)
    }
}