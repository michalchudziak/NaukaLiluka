import ExpoModulesCore
import WidgetKit
import SwiftUI

public class ReactNativeWidgetExtensionModule: Module {
    public func definition() -> ModuleDefinition {
        Name("ReactNativeWidgetExtension")
        
        Function("reloadWidget") { () in
            WidgetCenter.shared.reloadAllTimelines()
        }
        
        Function("reloadWidgetWithKind") { (kind: String) in
            WidgetCenter.shared.reloadTimelines(ofKind: kind)
        }
    }
}