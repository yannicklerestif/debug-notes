@file:Suppress("EXPERIMENTAL_API_USAGE","EXPERIMENTAL_UNSIGNED_LITERALS","PackageDirectoryMismatch","UnusedImport","unused","LocalVariableName","CanBeVal","PropertyName","EnumEntryName","ClassName","ObjectPropertyName","UnnecessaryVariable","SpellCheckingInspection")
package com.jetbrains.rider.debugnotes.model

import com.jetbrains.rd.framework.*
import com.jetbrains.rd.framework.base.*
import com.jetbrains.rd.framework.impl.*

import com.jetbrains.rd.util.lifetime.*
import com.jetbrains.rd.util.reactive.*
import com.jetbrains.rd.util.string.*
import com.jetbrains.rd.util.*
import kotlin.time.Duration
import kotlin.reflect.KClass
import kotlin.jvm.JvmStatic



/**
 * #### Generated from [DebugNotesModel.kt:10]
 */
class DebugNotesModel private constructor(
    private val _call: RdSignal<Call>,
    private val _method: RdSignal<MethodStructure>,
    private val _navigateMethod: RdSignal<MethodStructure>,
    private val _navigateClass: RdSignal<ClassStructure>
) : RdExtBase() {
    //companion
    
    companion object : ISerializersOwner {
        
        override fun registerSerializersCore(serializers: ISerializers)  {
            val classLoader = javaClass.classLoader
            serializers.register(LazyCompanionMarshaller(RdId(8218621816852584703), classLoader, "com.jetbrains.rider.debugnotes.model.MethodStructure"))
            serializers.register(LazyCompanionMarshaller(RdId(1532369579214666190), classLoader, "com.jetbrains.rider.debugnotes.model.ClassStructure"))
            serializers.register(LazyCompanionMarshaller(RdId(19639569), classLoader, "com.jetbrains.rider.debugnotes.model.Call"))
        }
        
        
        
        
        
        const val serializationHash = -5213528070320023201L
        
    }
    override val serializersOwner: ISerializersOwner get() = DebugNotesModel
    override val serializationHash: Long get() = DebugNotesModel.serializationHash
    
    //fields
    val call: ISignal<Call> get() = _call
    val method: ISignal<MethodStructure> get() = _method
    val navigateMethod: ISignal<MethodStructure> get() = _navigateMethod
    val navigateClass: ISignal<ClassStructure> get() = _navigateClass
    //methods
    //initializer
    init {
        bindableChildren.add("call" to _call)
        bindableChildren.add("method" to _method)
        bindableChildren.add("navigateMethod" to _navigateMethod)
        bindableChildren.add("navigateClass" to _navigateClass)
    }
    
    //secondary constructor
    internal constructor(
    ) : this(
        RdSignal<Call>(Call),
        RdSignal<MethodStructure>(MethodStructure),
        RdSignal<MethodStructure>(MethodStructure),
        RdSignal<ClassStructure>(ClassStructure)
    )
    
    //equals trait
    //hash code trait
    //pretty print
    override fun print(printer: PrettyPrinter)  {
        printer.println("DebugNotesModel (")
        printer.indent {
            print("call = "); _call.print(printer); println()
            print("method = "); _method.print(printer); println()
            print("navigateMethod = "); _navigateMethod.print(printer); println()
            print("navigateClass = "); _navigateClass.print(printer); println()
        }
        printer.print(")")
    }
    //deepClone
    override fun deepClone(): DebugNotesModel   {
        return DebugNotesModel(
            _call.deepClonePolymorphic(),
            _method.deepClonePolymorphic(),
            _navigateMethod.deepClonePolymorphic(),
            _navigateClass.deepClonePolymorphic()
        )
    }
    //contexts
    //threading
    override val extThreading: ExtThreadingKind get() = ExtThreadingKind.Default
}
val com.jetbrains.rd.ide.model.Solution.debugNotesModel get() = getOrCreateExtension("debugNotesModel", ::DebugNotesModel)



/**
 * #### Generated from [DebugNotesModel.kt:23]
 */
data class Call (
    val method: MethodStructure,
    val parent: MethodStructure
) : IPrintable {
    //companion
    
    companion object : IMarshaller<Call> {
        override val _type: KClass<Call> = Call::class
        override val id: RdId get() = RdId(19639569)
        
        @Suppress("UNCHECKED_CAST")
        override fun read(ctx: SerializationCtx, buffer: AbstractBuffer): Call  {
            val method = MethodStructure.read(ctx, buffer)
            val parent = MethodStructure.read(ctx, buffer)
            return Call(method, parent)
        }
        
        override fun write(ctx: SerializationCtx, buffer: AbstractBuffer, value: Call)  {
            MethodStructure.write(ctx, buffer, value.method)
            MethodStructure.write(ctx, buffer, value.parent)
        }
        
        
    }
    //fields
    //methods
    //initializer
    //secondary constructor
    //equals trait
    override fun equals(other: Any?): Boolean  {
        if (this === other) return true
        if (other == null || other::class != this::class) return false
        
        other as Call
        
        if (method != other.method) return false
        if (parent != other.parent) return false
        
        return true
    }
    //hash code trait
    override fun hashCode(): Int  {
        var __r = 0
        __r = __r*31 + method.hashCode()
        __r = __r*31 + parent.hashCode()
        return __r
    }
    //pretty print
    override fun print(printer: PrettyPrinter)  {
        printer.println("Call (")
        printer.indent {
            print("method = "); method.print(printer); println()
            print("parent = "); parent.print(printer); println()
        }
        printer.print(")")
    }
    //deepClone
    //contexts
    //threading
}


/**
 * #### Generated from [DebugNotesModel.kt:18]
 */
data class ClassStructure (
    val namespace: String,
    val className: String
) : IPrintable {
    //companion
    
    companion object : IMarshaller<ClassStructure> {
        override val _type: KClass<ClassStructure> = ClassStructure::class
        override val id: RdId get() = RdId(1532369579214666190)
        
        @Suppress("UNCHECKED_CAST")
        override fun read(ctx: SerializationCtx, buffer: AbstractBuffer): ClassStructure  {
            val namespace = buffer.readString()
            val className = buffer.readString()
            return ClassStructure(namespace, className)
        }
        
        override fun write(ctx: SerializationCtx, buffer: AbstractBuffer, value: ClassStructure)  {
            buffer.writeString(value.namespace)
            buffer.writeString(value.className)
        }
        
        
    }
    //fields
    //methods
    //initializer
    //secondary constructor
    //equals trait
    override fun equals(other: Any?): Boolean  {
        if (this === other) return true
        if (other == null || other::class != this::class) return false
        
        other as ClassStructure
        
        if (namespace != other.namespace) return false
        if (className != other.className) return false
        
        return true
    }
    //hash code trait
    override fun hashCode(): Int  {
        var __r = 0
        __r = __r*31 + namespace.hashCode()
        __r = __r*31 + className.hashCode()
        return __r
    }
    //pretty print
    override fun print(printer: PrettyPrinter)  {
        printer.println("ClassStructure (")
        printer.indent {
            print("namespace = "); namespace.print(printer); println()
            print("className = "); className.print(printer); println()
        }
        printer.print(")")
    }
    //deepClone
    //contexts
    //threading
}


/**
 * #### Generated from [DebugNotesModel.kt:12]
 */
data class MethodStructure (
    val namespace: String,
    val className: String,
    val methodName: String
) : IPrintable {
    //companion
    
    companion object : IMarshaller<MethodStructure> {
        override val _type: KClass<MethodStructure> = MethodStructure::class
        override val id: RdId get() = RdId(8218621816852584703)
        
        @Suppress("UNCHECKED_CAST")
        override fun read(ctx: SerializationCtx, buffer: AbstractBuffer): MethodStructure  {
            val namespace = buffer.readString()
            val className = buffer.readString()
            val methodName = buffer.readString()
            return MethodStructure(namespace, className, methodName)
        }
        
        override fun write(ctx: SerializationCtx, buffer: AbstractBuffer, value: MethodStructure)  {
            buffer.writeString(value.namespace)
            buffer.writeString(value.className)
            buffer.writeString(value.methodName)
        }
        
        
    }
    //fields
    //methods
    //initializer
    //secondary constructor
    //equals trait
    override fun equals(other: Any?): Boolean  {
        if (this === other) return true
        if (other == null || other::class != this::class) return false
        
        other as MethodStructure
        
        if (namespace != other.namespace) return false
        if (className != other.className) return false
        if (methodName != other.methodName) return false
        
        return true
    }
    //hash code trait
    override fun hashCode(): Int  {
        var __r = 0
        __r = __r*31 + namespace.hashCode()
        __r = __r*31 + className.hashCode()
        __r = __r*31 + methodName.hashCode()
        return __r
    }
    //pretty print
    override fun print(printer: PrettyPrinter)  {
        printer.println("MethodStructure (")
        printer.indent {
            print("namespace = "); namespace.print(printer); println()
            print("className = "); className.print(printer); println()
            print("methodName = "); methodName.print(printer); println()
        }
        printer.print(")")
    }
    //deepClone
    //contexts
    //threading
}
