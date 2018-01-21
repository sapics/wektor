import paper from 'paper'
import BaseTool from '../BaseTool'
import Matter from 'matter-js'
import { wektor, ChangeFlag } from '@/wektor'

const { Runner, Engine, Render, World, Bodies, Composites, Common, Svg, Vertices } = Matter
const { Point, Shape, Color } = paper

const specDefault = {
	label: 'matter',
	shortcut: 'm',
	dialog: {
		payload: {
			locked: true,
		},
		layout: {
			target: {
				type: 'drop',
				label: 'drop target:',
				allowedTypes: ['Group', 'Layer']
			},
			engineRun: {
				type: 'boolean',
				label: 'engine'
			},
		}
	},
	options: {
		target: null,
		engineRun: false,
	}
}

function boundsCenter(bounds) {
	return new Point(
		(bounds.min.x + bounds.max.x) / 2,
		(bounds.min.y + bounds.max.y) / 2
	);
}

var bodyOptions = {
	frictionAir: 0,
	friction: 1,
	restitution: 0,
	stiffness: 0
};

class MatterJsTool extends BaseTool {
	constructor(target, spec) {
		spec = Object.assign({}, specDefault, spec)
		super(target, spec)

		this.label = 'matter'
		this.shortcut = 'm'
		this.on('activate', this.openDialog)

		const engine = this.engine = Engine.create()

		engine.world.gravity.y = 0.1

		var size = paper.view.size;
		this.addRectangle(size.width / 2, size.height - 10, size.width, 20, true);

		let count = 0
		paper.view.onFrame = event => {
			// if (count++ < 4)
			// 	return
			// else
			// 	count = 0
			
			var bodies = this.engine.world.bodies;
			for (var i = 0; i < bodies.length; i++) {
				var body = bodies[i];
				var item = body.item;
				item.position = body.position;
				item.rotation =  body.angle * 180 / Math.PI;
				// if (notInView(body)) {
				//   World.remove(engine.world, body);
				//   item.remove();
				// }
			}
		}

		console.log(Infinity)
	}

	onDialogChange(target, key, value) {
		switch (key) {
			case 'target':
				const paperItem = wektor.project.getItem({ id: value.id })
				paperItem && this.initTarget(paperItem)
				break
			case 'engineRun':
				if (value)
					Runner.run(this.engine)
				else 
					Runner.stop(this.engine)
				break
		}
	}

	initTarget(item) {
		this.target = item
		// wektor.changeTracker.onItemChange(item.id, ChangeFlag.CHILDREN, () => {
		// 	console.log('children')
		// })
		
		for (const child of item.children) {
			if (item.data.iterable !== false)
				this.addMatterVertices(child)
		}
	}

	addBody(body, item) {
		body.item = item
		World.add(this.engine.world, body)
	}

	addRectangle(x, y, w, h, isStatic) {
		var body = Bodies.rectangle(x, y, w, h, Object.assign({
		isStatic: isStatic
		}, bodyOptions));
		var item = new Shape.Rectangle({
			point: [x, y],
			size: [w, h],
			fillColor: Color.random()
		});
		this.addBody(body, item);
	}	

	// create circle
	addCircle(x, y, r, isStatic) {
		var body = Bodies.circle(x, y, r, Object.assign({
		isStatic: isStatic
		}, bodyOptions));
		var item = new paper.Path.Circle({
			center: new Point(x, y),
			radius: r,
			fillColor: Color.random()
		});
		item.on('change', () => {
			
		})		
		this.addBody(body, item);
	}	

	addMatterVertices(path) {
		const clone = path.clone()
		clone.data.iterable = false
		clone.flatten()

		const vertices = clone.segments.map(segment => {
			return { x: segment.point.x, y: segment.point.y } 
		})
		clone.remove()

		const position = path.position
		const body = Bodies.fromVertices(position.x, position.y, vertices)

		if (body) {
			// align matterjs body with paperjs drawn shape
			const difference = position.subtract(boundsCenter(body.bounds))
			Matter.Body.translate(body, difference)
			path.pivot = position.add(difference)
			this.addBody(body, path)
		} else {
			path.remove()
		}
	}	
}

export default MatterJsTool